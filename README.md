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

