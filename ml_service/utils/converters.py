"""Measurement conversion utilities with comprehensive type hints"""

from typing import Optional, Tuple, Union, Dict, Any


def parse_height(height_input: Union[Dict[str, Any], Any]) -> Tuple[Optional[float], str]:
    """
    Parse height input and convert to centimeters with formatted display string.

    Args:
        height_input: Height measurement (dict with 'cm' or 'ft'/'inch', or LengthMeasurement)

    Returns:
        Tuple of (height_in_cm, formatted_display_string)

    Examples:
        >>> parse_height({"cm": 175})
        (175.0, "175 cm")
        >>> parse_height({"ft": 5, "inch": 10})
        (177.8, "5'10\"")
    """
    cm, formatted_str, _ = parse_measurement(height_input)
    if cm is None:
        return None, ""
    return cm, formatted_str


def parse_weight(
    weight_input: Union[Dict[str, Any], str, int, float, Any]
) -> Tuple[Optional[float], str, Optional[str]]:
    """
    Parse weight input into kilograms, formatted display, and unit.

    Args:
        weight_input: Weight measurement in various formats

    Returns:
        Tuple of (weight_kg, display_str, unit)

    Examples:
        >>> parse_weight({"kg": 70})
        (70.0, "70 kg", "kg")
        >>> parse_weight({"lbs": 154})
        (69.85, "154 lbs", "lbs")
    """
    if not weight_input:
        return None, "", None

    # Convert model to dict if needed
    if hasattr(weight_input, "dict"):
        weight_input = weight_input.dict()

    # Dict case
    if isinstance(weight_input, dict):
        if "kg" in weight_input and weight_input["kg"] is not None:
            val = float(weight_input["kg"])
            return val, f"{val} kg", "kg"
        elif "lbs" in weight_input and weight_input["lbs"] is not None:
            val = float(weight_input["lbs"])
            kg = val / 2.2046226218
            return kg, f"{val} lbs", "lbs"

    # String cases
    if isinstance(weight_input, str):
        lower = weight_input.lower().strip()
        if "kg" in lower:
            val = float(lower.replace("kg", "").strip())
            return val, f"{val} kg", "kg"
        elif "lb" in lower:
            val = float(lower.replace("lbs", "").replace("lb", "").strip())
            kg = val / 2.2046226218
            return kg, f"{val} lbs", "lbs"

    # Raw numeric fallback (assume kg)
    if isinstance(weight_input, (int, float)):
        return float(weight_input), f"{float(weight_input)} kg", "kg"

    return None, "", None


def parse_measurement(
    measurement: Union[Dict[str, Any], Any]
) -> Tuple[Optional[float], str, Optional[str]]:
    """
    Parse measurement into cm with formatted display and unit.

    Args:
        measurement: Length measurement (dict with 'cm' or 'ft'/'inch', or LengthMeasurement)

    Returns:
        Tuple of (value_in_cm, formatted_str, unit)

    Examples:
        >>> parse_measurement({"cm": 100})
        (100.0, "100 cm", "cm")
        >>> parse_measurement({"ft": 6, "inch": 0})
        (182.88, "6'0\"", "ft/in")
    """
    if not measurement:
        return None, "", None

    # Convert model to dict if needed
    if hasattr(measurement, "dict"):
        measurement = measurement.dict()

    # Direct cm case
    if isinstance(measurement, dict) and "cm" in measurement and measurement["cm"] is not None:
        val = float(measurement["cm"])
        return val, f"{val} cm", "cm"

    # Feet and inches case
    if isinstance(measurement, dict):
        ft = float(measurement.get("ft", 0))
        inch = float(measurement.get("inch", 0))
        if ft or inch:
            cm = ft * 30.48 + inch * 2.54
            return cm, f"{int(ft)}'{int(inch)}\"", "ft/in"

    return None, "", None


def kg_to_lbs(kg: float) -> float:
    """Convert kilograms to pounds"""
    return kg * 2.2046226218


def lbs_to_kg(lbs: float) -> float:
    """Convert pounds to kilograms"""
    return lbs / 2.2046226218


def cm_to_inches(cm: float) -> float:
    """Convert centimeters to inches"""
    return cm / 2.54


def inches_to_cm(inches: float) -> float:
    """Convert inches to centimeters"""
    return inches * 2.54


def cm_to_feet_inches(cm: float) -> Tuple[int, int]:
    """
    Convert centimeters to feet and inches.

    Returns:
        Tuple of (feet, inches)
    """
    total_inches = cm / 2.54
    feet = int(total_inches // 12)
    inches = int(total_inches % 12)
    return feet, inches
