import io
from groq import AsyncGroq
from app.config import get_settings


async def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    settings = get_settings()
    client = AsyncGroq(api_key=settings.groq_api_key)

    audio_file = (filename, io.BytesIO(audio_bytes), _get_mime_type(filename))

    transcription = await client.audio.transcriptions.create(
        file=audio_file,
        model=settings.whisper_model,
        language="en",
        response_format="text",
    )

    return transcription.strip()


def _get_mime_type(filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    mime_map = {
        "m4a": "audio/m4a",
        "mp4": "audio/mp4",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "webm": "audio/webm",
        "ogg": "audio/ogg",
    }
    return mime_map.get(ext, "audio/m4a")
