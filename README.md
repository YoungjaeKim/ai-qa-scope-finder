# ai-qa-scope-finder
AI-powered QA Test Case scoping and filtering

## Mission

BlackBox QA를 할 때, 사양서와 실제 코드 변경사항의 차이를 분석하여 필요한 QA Test Case만 필터링하여 QA의 효율을 높이고 QA 비용을 절감하는 것을 목적으로 한다.

특허출원 10-2023-0033143 구현; https://doi.org/10.8080/1020230033143

## Requirements
1. Specification Snapshot - 사양서가 시간별로 누적된다.
2. Repository - GitHub Repo
3. QA Test Case - QA가 작성한 테스트케이스

## Architecture

The repository includes a React + TypeScript frontend (`client`) and an Express + MongoDB backend (`server`).
Test cases are uploaded as CSV files where each line describes a test case identifier followed by step descriptions.
The backend reads git diffs from a repository, sends them together with the test cases to the ChatGPT API, and returns only impacted test cases.

### Environment

Create a `.env` file based on `.env.example` and supply values for `OPENAI_API_KEY` and `MONGODB_URI`.

### Development

```bash
# start backend
npm --prefix server run dev
# start frontend
npm --prefix client run dev
```

## CSV Format

The test cases should be uploaded as a CSV file where each row represents a test case. The format is:

```
<test_case_id>,<step1>,<step2>,<step3>,...
```

### Example CSV File

```csv
TC001,Login to application,Navigate to dashboard,Verify user profile
TC002,Open settings page,Change password,Save changes,Logout
TC003,Create new project,Add project details,Upload files,Submit project
TC004,Search for existing project,Filter by date,Export results
TC005,Login as admin,Access user management,Delete inactive users,Generate report
```

Each line contains:
- **Test Case ID**: Unique identifier for the test case (first column)
- **Steps**: Comma-separated list of test steps describing the test scenario (remaining columns)

The system will analyze git diffs and determine which test cases are potentially affected by code changes.

