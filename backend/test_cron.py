from croniter import croniter
from datetime import datetime

c = croniter('*/5 * * * *', datetime.now())
next_time = c.get_next(datetime)
print(f"Next run time: {next_time}")
