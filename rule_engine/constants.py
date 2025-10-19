from enum import Enum

COLLECTION_NAME = "properties"
COLLECTION_NAME_VALIDITY_DATA = "validity_data"


# Field names from the rules engine
class FIELD_NAMES_RE(Enum):
    VALIDITY_SCORE = "validity_score"
    COMMUNITY_SCORE = "community_score"
    ID = "id"


# Field names for firestore
class FIELD_NAMES_FE(Enum):
    VALIDITY_SCORE = "validityScore"
    COMMUNITY_SCORE = "communityScore"
    ID = "id"
