from enum import Enum

class Role(str, Enum):
    INTER = "INTERVIEWER"
    CAND = "CANDIDATE"

class Status(str,Enum):
    CREATED= "CREATED"
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"
