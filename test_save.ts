import { updateRecruiterProfileInDb } from "./src/app/actions/profileActions";

async function main() {
    console.log("Starting test...");
    const profileData = {
        firstName: "Debug",
        lastName: "Test",
        companyName: "Debug Corp",
        jobTitle: "Tester"
    };

    try {
        const result = await updateRecruiterProfileInDb("test@example.com", profileData);
        console.log("Result:", result);
    } catch (e) {
        console.error("Exception thrown:", e);
    }
}
main();
