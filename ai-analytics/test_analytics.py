from analytics import calculate_analytics


projects = [
    {
        "project_id": 101,
        "project_name": "Road Development",
        "risk_level": "CRITICAL"
    },
    {
        "project_id": 102,
        "project_name": "Bridge Construction",
        "risk_level": "HIGH"
    },
    {
        "project_id": 103,
        "project_name": "Water Supply",
        "risk_level": "MEDIUM"
    },
    {
        "project_id": 104,
        "project_name": "School Building",
        "risk_level": "LOW"
    }
]


result = calculate_analytics(projects)

print(result)