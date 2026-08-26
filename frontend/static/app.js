const API_URL = "/api/jobs/";

let allJobs = [];

/* =========================
   CSRF TOKEN
========================= */

function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }

    return cookieValue;
}


/* =========================
   START
========================= */

document.addEventListener("DOMContentLoaded", () => {

    loadJobs();

    const form = document.getElementById("jobForm");

    if (form) {
        form.addEventListener("submit", addJob);
    }

    const searchInput =
        document.getElementById("searchInput");

    const statusFilter =
        document.getElementById("statusFilter");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            filterJobs
        );
    }

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            filterJobs
        );
    }
});


/* =========================
   LOAD JOBS
========================= */

async function loadJobs() {

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Failed to load applications");
        }

        allJobs = await response.json();

        console.log("Jobs loaded:", allJobs);

        updateStats(allJobs);

        filterJobs();

    } catch (error) {

        console.error("Load error:", error);

        const jobList =
            document.getElementById("jobList");

        if (jobList) {

            jobList.innerHTML = `
                <div class="empty-message">
                    Unable to load applications.
                </div>
            `;
        }
    }
}


/* =========================
   DISPLAY JOBS
========================= */

function displayJobs(jobs) {

    const jobList =
        document.getElementById("jobList");

    if (!jobList) {
        return;
    }

    jobList.innerHTML = "";

    if (jobs.length === 0) {

        jobList.innerHTML = `
            <div class="empty-message">
                No applications found.
            </div>
        `;

        return;
    }

    jobs.forEach(job => {

        const card =
            document.createElement("div");

        card.className = "job-card";

        const statusClass =
            getStatusClass(job.status);

        card.innerHTML = `

            <div class="job-card-header">

                <div>

                    <h3>
                        ${escapeHTML(job.company_name)}
                    </h3>

                    <span class="status-badge ${statusClass}">
                        ${escapeHTML(job.status)}
                    </span>

                </div>

            </div>

            <p>
                <strong>Job Title:</strong>
                ${escapeHTML(job.job_title)}
            </p>

            <p>
                <strong>Location:</strong>
                ${escapeHTML(job.location)}
            </p>

            <p>
                <strong>Application Date:</strong>
                ${escapeHTML(job.application_date)}
            </p>

            <p>
                <strong>Notes:</strong>
                ${escapeHTML(job.notes || "No notes")}
            </p>

            ${
                job.job_url
                    ? `
                        <a
                            class="job-link"
                            href="${escapeAttribute(job.job_url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Job →
                        </a>
                    `
                    : ""
            }

            <div class="job-actions">

                <button
                    type="button"
                    class="edit-button"
                    onclick="editJob(${job.id})"
                >
                    ✏️ Edit
                </button>

                <button
                    type="button"
                    class="delete-button"
                    onclick="deleteJob(${job.id})"
                >
                    🗑️ Delete
                </button>

            </div>
        `;

        jobList.appendChild(card);
    });
}


/* =========================
   STATISTICS
========================= */

function updateStats(jobs) {

    document.getElementById("total").textContent =
        jobs.length;

    document.getElementById("applied").textContent =
        jobs.filter(
            job => job.status === "Applied"
        ).length;

    document.getElementById("interviews").textContent =
        jobs.filter(
            job => job.status === "Interview"
        ).length;

    document.getElementById("offers").textContent =
        jobs.filter(
            job => job.status === "Offer"
        ).length;
}


/* =========================
   ADD JOB
========================= */

async function addJob(event) {

    event.preventDefault();

    const data = {

        company_name:
            document.getElementById(
                "company_name"
            ).value.trim(),

        job_title:
            document.getElementById(
                "job_title"
            ).value.trim(),

        location:
            document.getElementById(
                "location"
            ).value.trim(),

        job_url:
            document.getElementById(
                "job_url"
            ).value.trim(),

        application_date:
            document.getElementById(
                "application_date"
            ).value,

        status:
            document.getElementById(
                "status"
            ).value,

        notes:
            document.getElementById(
                "notes"
            ).value.trim()
    };

    try {

        const csrfToken =
            getCookie("csrftoken");

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json",

                "Accept":
                    "application/json",

                "X-CSRFToken":
                    csrfToken
            },

            credentials: "same-origin",

            body:
                JSON.stringify(data)
        });

        const result =
            await response.json();

        console.log(
            "POST response:",
            result
        );

        if (!response.ok) {

            console.error(
                "POST error:",
                result
            );

            alert(
                "Failed to add application.\n\n" +
                JSON.stringify(
                    result,
                    null,
                    2
                )
            );

            return;
        }

        document
            .getElementById("jobForm")
            .reset();

        await loadJobs();

        alert(
            "Job application added successfully!"
        );

    } catch (error) {

        console.error(
            "Add error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


/* =========================
   DELETE
========================= */

async function deleteJob(id) {

    if (
        !confirm(
            "Are you sure you want to delete this application?"
        )
    ) {
        return;
    }

    try {

        const csrfToken =
            getCookie("csrftoken");

        const response =
            await fetch(
                `${API_URL}${id}/`,
                {
                    method: "DELETE",

                    headers: {
                        "X-CSRFToken":
                            csrfToken,

                        "Accept":
                            "application/json"
                    },

                    credentials:
                        "same-origin"
                }
            );

        if (!response.ok) {

            alert(
                "Failed to delete application."
            );

            return;
        }

        await loadJobs();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete application."
        );
    }
}


/* =========================
   EDIT
========================= */

async function editJob(id) {

    const job =
        allJobs.find(
            item => item.id === id
        );

    if (!job) {

        alert(
            "Application not found."
        );

        return;
    }

    const newStatus =
        prompt(
            "Enter new status:\n\n" +
            "Applied\n" +
            "Interview\n" +
            "Assessment\n" +
            "Rejected\n" +
            "Offer",
            job.status
        );

    if (newStatus === null) {
        return;
    }

    const status =
        newStatus.trim();

    const validStatuses = [
        "Applied",
        "Interview",
        "Assessment",
        "Rejected",
        "Offer"
    ];

    if (
        !validStatuses.includes(status)
    ) {

        alert(
            "Invalid status."
        );

        return;
    }

    const updatedJob = {

        company_name:
            job.company_name,

        job_title:
            job.job_title,

        location:
            job.location,

        job_url:
            job.job_url || "",

        application_date:
            job.application_date,

        status:
            status,

        notes:
            job.notes || ""
    };

    try {

        const csrfToken =
            getCookie("csrftoken");

        const response =
            await fetch(
                `${API_URL}${id}/`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "X-CSRFToken":
                            csrfToken
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify(
                            updatedJob
                        )
                }
            );

        const result =
            await response.json();

        console.log(
            "PUT response:",
            result
        );

        if (!response.ok) {

            alert(
                "Failed to update application.\n\n" +
                JSON.stringify(
                    result,
                    null,
                    2
                )
            );

            return;
        }

        await loadJobs();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update application."
        );
    }
}


/* =========================
   SEARCH / FILTER
========================= */

function filterJobs() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";

    const status =
        statusFilter
            ? statusFilter.value
            : "All";

    const filteredJobs =
        allJobs.filter(job => {

            const company =
                (
                    job.company_name || ""
                ).toLowerCase();

            const title =
                (
                    job.job_title || ""
                ).toLowerCase();

            const location =
                (
                    job.location || ""
                ).toLowerCase();

            const matchesSearch =
                company.includes(search) ||
                title.includes(search) ||
                location.includes(search);

            const matchesStatus =
                status === "All" ||
                job.status === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    displayJobs(filteredJobs);
}


/* =========================
   STATUS
========================= */

function getStatusClass(status) {

    switch (status) {

        case "Applied":
            return "status-applied";

        case "Interview":
            return "status-interview";

        case "Assessment":
            return "status-assessment";

        case "Rejected":
            return "status-rejected";

        case "Offer":
            return "status-offer";

        default:
            return "";
    }
}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHTML(value);
}