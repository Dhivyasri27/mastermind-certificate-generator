import os
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
    is_production = os.getenv('FLASK_ENV', '').lower() == 'production'

    if mongo_uri and "mongodb" in mongo_uri.lower():
        try:
            logger.info(f"Connecting to MongoDB Atlas (DB: {db_name})...")
            # 5-second timeout for server selection
            client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            # Verify connectivity via ping
            client.admin.command('ping')
            _db_instance = client[db_name]
            logger.info(f"Successfully connected to MongoDB Atlas database '{db_name}'!")
            return _db_instance
        except Exception as e:
            logger.error(f"MongoDB Atlas connection failure: {e}")
            if is_production:
                raise ConnectionError(
                    f"FATAL: Production MongoDB Atlas connection failed ({e}). "
                    "Refusing to silently switch to in-memory mongomock in production."
                )
            logger.warning("MongoDB Atlas connection failed in development.")

    # Guard: Never allow mongomock in production
    if is_production:
        raise ConnectionError(
            "FATAL: FLASK_ENV=production but no valid MONGO_URI was provided. "
            "A verified MongoDB Atlas connection string is required for production persistence."
        )

    # Development fallback only
    if Config.ALLOW_MOCK_DB:
        logger.warning(f"Development Mode: Using in-memory mongomock database '{db_name}'.")
        mock_client = mongomock.MongoClient()
        _db_instance = mock_client[db_name]
        return _db_instance
    else:
        raise ConnectionError("MongoDB connection failed and ALLOW_MOCK_DB is disabled.")
