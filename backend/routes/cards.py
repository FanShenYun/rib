import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import Card
from schemas import CardCreate, CardUpdate, CardResponse, ReorderRequest
from auth import get_current_user
from ws import manager

router = APIRouter()


@router.get("", response_model=List[CardResponse])
async def list_cards(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    result = await db.execute(select(Card).order_by(Card.sort_order))
    return result.scalars().all()


@router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    body: CardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # Determine next sort_order for the zone
    result = await db.execute(
        select(Card).where(Card.zone == body.zone).order_by(Card.sort_order.desc())
    )
    last = result.scalars().first()
    next_order = (last.sort_order + 1) if last else 0

    card = Card(
        raw_text=body.raw_text,
        time_field=body.time_field,
        location=body.location,
        summary=body.summary,
        zone=body.zone,
        sort_order=next_order,
        created_by=current_user,
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)

    await manager.broadcast({"type": "card_created", "data": _serialize(card)})
    return card


@router.put("/reorder")
async def reorder_cards(
    body: ReorderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    for item in body.updates:
        result = await db.execute(select(Card).where(Card.id == item.id))
        card = result.scalar_one_or_none()
        if card:
            card.sort_order = item.sort_order
            card.zone = item.zone
            card.updated_at = datetime.now(timezone.utc)
    await db.commit()

    result = await db.execute(select(Card).order_by(Card.sort_order))
    all_cards = result.scalars().all()
    await manager.broadcast({
        "type": "cards_reordered",
        "data": [_serialize(c) for c in all_cards],
    })
    return {"ok": True}


@router.put("/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: uuid.UUID,
    body: CardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="白板條不存在")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(card, field, value)
    card.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(card)

    await manager.broadcast({"type": "card_updated", "data": _serialize(card)})
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="白板條不存在")

    await db.delete(card)
    await db.commit()

    await manager.broadcast({"type": "card_deleted", "data": {"id": str(card_id)}})


def _serialize(card: Card) -> dict:
    return {
        "id": str(card.id),
        "raw_text": card.raw_text,
        "time_field": card.time_field,
        "location": card.location,
        "summary": card.summary,
        "zone": card.zone,
        "sort_order": card.sort_order,
        "collaboration_status": card.collaboration_status,
        "urgency": card.urgency,
        "created_by": card.created_by,
        "created_at": card.created_at.isoformat() if card.created_at else None,
        "updated_at": card.updated_at.isoformat() if card.updated_at else None,
    }
