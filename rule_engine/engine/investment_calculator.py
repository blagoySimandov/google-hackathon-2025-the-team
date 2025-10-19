from typing import List
from .models import InvestmentAnalysis, AppliedGrant, RenovationItem
from config import (
    LABOUR_COST_PERCENTAGE,
    VACANT_PROPERTY_GRANT_AMOUNT,
    DERELICT_PROPERTY_TOP_UP_GRANT,
    SEAI_GRANT_KEYWORDS
)

class InvestmentCalculator:
    """
    Calculates the financial viability of a renovation project,
    including labour costs, grants, and potential ROI.
    """
    def _calculate_labour_cost(self, renovation_materials_cost: float) -> float:
        """Estimates labour cost as a percentage of material costs."""
        return renovation_materials_cost * LABOUR_COST_PERCENTAGE

    def _identify_potential_grants(self, renovation_items: List[RenovationItem]) -> List[AppliedGrant]:
        """
        Identifies potential government grants based on the nature of the property
        and the renovation items identified by the vision model.
        """
        grants = []
        applied_grant_types = set()

        # 1. Vacant & Derelict Property Grants
        # We assume the property is eligible as the tool's purpose is to find them.
        grants.append(AppliedGrant(
            name="Vacant Property Refurbishment Grant",
            amount=VACANT_PROPERTY_GRANT_AMOUNT,
            reason="Assumed eligibility as a vacant home."
        ))
        grants.append(AppliedGrant(
            name="Derelict Property Top-up",
            amount=DERELICT_PROPERTY_TOP_UP_GRANT,
            reason="Potential top-up grant for derelict properties."
        ))
        
        # 2. SEAI Grants (based on keywords)
        renovation_text = " ".join(item.item.lower() + " " + item.reason.lower() for item in renovation_items)
        for keyword, amount in SEAI_GRANT_KEYWORDS.items():
            if keyword in renovation_text and keyword not in applied_grant_types:
                grants.append(AppliedGrant(
                    name=f"SEAI Grant - {keyword.capitalize()}",
                    amount=amount,
                    reason=f"Keyword '{keyword}' found in renovation items."
                ))
                applied_grant_types.add(keyword)

        return grants

    def calculate(
        self,
        listed_price: float,
        renovation_details: dict,
        market_average_price: float
    ) -> InvestmentAnalysis:
        """
        Performs the full investment analysis for a property.
        """
        renovation_items = [RenovationItem.model_validate(item) for item in renovation_details['items']]
        renovation_materials_cost = renovation_details['total_cost']

        # --- Calculations ---
        labour_cost = self._calculate_labour_cost(renovation_materials_cost)
        potential_grants = self._identify_potential_grants(renovation_items)
        total_grant_amount = sum(grant.amount for grant in potential_grants)
        
        # Total upfront cost before any grants
        total_project_cost = listed_price + renovation_materials_cost + labour_cost
        
        # Net cost after grants are deducted
        net_project_cost = total_project_cost - total_grant_amount

        # The estimated value after renovations are complete
        estimated_arv = market_average_price

        potential_profit = estimated_arv - net_project_cost

        # Calculate Return on Investment (ROI)
        roi = (potential_profit / net_project_cost) * 100 if net_project_cost > 0 else 0
        
        return InvestmentAnalysis(
            estimated_labour_cost=round(labour_cost, 2),
            total_project_cost=round(total_project_cost, 2),
            potential_grants=potential_grants,
            total_grant_amount=round(total_grant_amount, 2),
            net_project_cost=round(net_project_cost, 2),
            estimated_after_repair_value=round(estimated_arv, 2),
            potential_profit=round(potential_profit, 2),
            return_on_investment_percent=round(roi, 2)
        )