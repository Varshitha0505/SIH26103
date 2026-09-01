from fastapi import FastAPI

app = FastAPI(
    title="SIH26103 Project Monitoring Platform",
    description="Web-based integrated project monitoring platform",
    version="1.0.0"
)

projects = [
    {
        "project_id": "701398",
        "project_name": "Nardave Medium Irrigation Project",
        "state": "Maharashtra",
        "physical_progress": 75
    },
    {
        "project_id": "701400",
        "project_name": "Thoubal Multipurpose Project",
        "state": "Manipur",
        "physical_progress": 99
    }
]


@app.get("/")
def home():
    return {
        "message": "Project Monitoring Platform Backend is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/projects")
def get_projects(
    state: str | None = None,
    min_progress: float | None = None
):
    result = projects

    if state:
        result = [
            project for project in result
            if project["state"].lower() == state.lower()
        ]

    if min_progress is not None:
        result = [
            project for project in result
            if project["physical_progress"] >= min_progress
        ]

    return result
@app.get("/projects/{project_id}")
def get_project(project_id: str):
    for project in projects:
        if project["project_id"] == project_id:
            return project

    return {"error": "Project not found"}