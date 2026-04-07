import os
import json
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from schemas import ParseRequest, ParseResponse
from auth import get_current_user

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
model = genai.GenerativeModel("gemini-2.5-flash-lite")

SYSTEM_PROMPT = """你是一個專門解析無線電通訊內容的助手，服務對象為軍事聯訓計畫組。
請將收到的無線電原始文字解析為結構化資料，以 JSON 格式回應。

回傳格式（僅回傳 JSON，不含其他說明文字）：
{
  "time_field": "時間（如 09:30，若無法判斷則留空字串）",
  "location": "位置（若無法判斷則留空字串）",
  "summary": "事件概述（若無法判斷則留空字串）"
}

注意事項：
- 時間可能以軍事時間格式出現（如 0930、09:30）
- 位置可能使用縮寫或方位描述（如北側、左翼、OP3）
- 概述應精簡扼要，保留關鍵資訊
- 若某欄位真的無法判斷，回傳空字串""，不要捏造
"""


@router.post("", response_model=ParseResponse)
async def parse_radio(
    body: ParseRequest,
    current_user: str = Depends(get_current_user),
):
    try:
        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\n無線電內容：{body.raw_text}",
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=300,
            ),
        )
        raw = response.text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return ParseResponse(
            time_field=data.get("time_field", ""),
            location=data.get("location", ""),
            summary=data.get("summary", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 解析失敗: {str(e)}")
