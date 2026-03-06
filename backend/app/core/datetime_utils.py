from datetime import datetime, timezone, timedelta

BEIJING_TZ = timezone(timedelta(hours=8))

def now_beijing() -> datetime:
    return datetime.now(BEIJING_TZ)

def to_beijing(dt: datetime) -> datetime:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=BEIJING_TZ)
    return dt.astimezone(BEIJING_TZ)

def to_iso_string(dt: datetime) -> str:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=BEIJING_TZ)
    return dt.isoformat()
