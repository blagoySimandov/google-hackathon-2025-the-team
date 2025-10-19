"""
Viability Engine Package.

This file makes the core components of the engine directly accessible,
providing a simplified public API for the package.
"""

# Import the main orchestrator class to make it directly available.
# This allows you to write:
#   from engine import ViabilityEngine
# instead of the more verbose:
#   from engine.main import ViabilityEngine
from .main import ViabilityEngine

# You can also expose key data models if they are needed for type hinting
# or creating objects outside of the engine's main run function.
from .models import PropertyListing, RenovationCost, AmenityResult
