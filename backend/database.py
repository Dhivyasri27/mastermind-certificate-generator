import pymongo
import mongomock
import logging
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_db_instance = None

def get_db():
    global _db_instance
    if _db_instance is not None:
        return _db_instance

    mongo_uri = Config.MONGO_URI
    db_name = Config.DB_NAME

    try:
        if mongo_uri and "mongodb" in mongo_uri.lower():
            logger.info(f"Connecting to MongoDB at {mongo_uri[:20]}...")
            client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
            # Trigger server selection check
            client.admin.command('ping')
            _db_instance = client[db_name]
            logger.info("Successfully connected to MongoDB Atlas / Server!")
            return _db_instance
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to in-memory mongomock database for seamless dev testing.")
    
    # Fallback to mongomock client for zero-config testing
    mock_client = mongomock.MongoClient()
    _db_instance = mock_client[db_name]
    logger.info("Using mock MongoDB database instance.")
    return _db_instance
