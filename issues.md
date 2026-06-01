SonarCloud Plain-Text Report
Project: DevSync
Project Key: aabir-2004_DevSync
Source: https://sonarcloud.io/project/information?id=aabir-2004_DevSync
Report Date: 2026-06-01

1. Analysis Snapshot

- Main branch: main
- Latest analysis time (UTC): 2026-06-01 13:32:06
- Latest analyzed commit: feb18bf003428222aefdd898d5d11a85175a4dc2
- Commit message: Update README.md
- Quality Gate: OK

2. Executive Summary

The SonarCloud quality gate is currently passing, which means the project is not blocked by SonarCloud's configured gate conditions. However, the codebase still contains a meaningful maintainability backlog and one reliability issue that should be reviewed.

The most important follow-up areas are:
- 1 bug still open
- 150 code smells still open
- 2 security hotspots still waiting for review
- 0% of security hotspots reviewed

3. Core Metrics

- Lines of code (ncloc): 9,301
- Total lines: 10,427
- Files analyzed: 67
- Functions: 374
- Statements: 1,326
- Complexity: 877
- Cognitive complexity: 521
- Duplicated lines: 206
- Duplicated blocks: 10
- Duplicated lines density: 2.0%
- Comment lines density: 4.7%

4. Quality Ratings

Note: SonarCloud returned numeric ratings. The letter grades below are inferred from Sonar's standard scale where 1.0 = A, 2.0 = B, 3.0 = C, 4.0 = D, and 5.0 = E.

- Overall quality gate status: OK
- Reliability rating: 2.0 (B)
- Security rating: 1.0 (A)
- Maintainability rating (sqale_rating): 1.0 (A)

5. Issue Totals

- Total open issues: 151
- Bugs: 1
- Vulnerabilities: 0
- Code smells: 150
- Security hotspots: 2
- Security hotspots reviewed: 0.0%

6. Issue Breakdown By Severity

- Critical: 2
- Major: 60
- Minor: 89

7. Issue Breakdown By Type

- Bug: 1
- Code smell: 150

8. Most Common Rule Violations

- typescript:S1128: 37 issues
  Summary: unnecessary imports should be removed
- typescript:S6853: 20 issues
  Summary: form labels must be associated with controls
- typescript:S6759: 19 issues
  Summary: component props should be read-only
- typescript:S3358: 15 issues
  Summary: nested ternary operators should be extracted
- typescript:S4325: 10 issues
  Summary: redundant assertions should be removed
- typescript:S6479: 9 issues
  Summary: array index should not be used as React key
- typescript:S7764: 9 issues
  Summary: prefer globalThis over window
- typescript:S1854: 7 issues
  Summary: useless assignments should be removed

9. Files With The Highest Issue Count

- app/(dashboard)/dsa/page.tsx: 10 issues
- app/(dashboard)/admin/page.tsx: 8 issues
- components/layout/RightPanel.tsx: 8 issues
- app/(dashboard)/forums/page.tsx: 7 issues
- app/(dashboard)/page.tsx: 7 issues
- components/layout/Navbar.tsx: 7 issues
- app/(dashboard)/announcements/page.tsx: 6 issues
- components/resources/ResourceUploadForm.tsx: 6 issues
- components/shared/VoteButton.tsx: 6 issues
- app/(dashboard)/profile/[id]/page.tsx: 5 issues

10. Notable Reliability Issue

SonarCloud reports 1 open bug. The API response returned this bug item:

- File: components/shared/Tag.tsx
- Line: 40
- Severity: MINOR
- Message: Visible, non-interactive elements with click handlers must have at least one keyboard listener.

This appears to be an accessibility-related reliability issue. Even though the severity is minor, it is the only issue currently counted in the bug category and is the reason the reliability rating is not A.

11. Security Hotspots Requiring Review

SonarCloud reports 2 security hotspots, both still in TO_REVIEW status:

- components/blogs/BlogCard.tsx, line 34
  Message: regex may be vulnerable to super-linear runtime due to backtracking, which could lead to denial of service

- lib/slugify.ts, line 10
  Message: regex may be vulnerable to super-linear runtime due to backtracking, which could lead to denial of service

These are not counted as confirmed vulnerabilities yet, but they should be manually reviewed and either fixed or marked safe with justification.

12. Missing Or Unavailable Metrics

The following metrics were requested from the public API but were not returned for this project snapshot:

- Coverage
- Tests
- Test errors
- Test failures
- Skipped tests

This usually means the current SonarCloud analysis did not publish those measures, or they are not available through the public project response used for this report.

13. Practical Interpretation

- Strengths:
  Security rating is strong, no confirmed vulnerabilities were reported, duplication is low, and the quality gate is passing.

- Main weaknesses:
  Maintainability debt is concentrated in repeated TypeScript and React issues such as unused imports, accessibility label problems, readonly prop usage, nested ternaries, and unstable list keys.

- Highest-value cleanup path:
  Start with the top 10 files by issue count, review the 2 security hotspots, and fix the single open bug in components/shared/Tag.tsx.

14. Recommended Next Steps

1. Fix the single open bug in components/shared/Tag.tsx.
2. Review both regex-related security hotspots and either remediate or mark them safe with justification.
3. Clean up the repeated low-effort TypeScript issues, especially unused imports and redundant assertions.
4. Refactor nested ternaries in dashboard pages and layout components to improve readability.
5. Fix accessibility issues around labels and keyboard interaction first, since they affect real user behavior.
6. Re-run SonarCloud after cleanup to confirm whether reliability returns to A and whether issue volume drops materially.

15. Source Notes

This report was generated from SonarCloud public Web API endpoints rather than the project UI because the direct project page returned HTTP 403 in this environment.

Relevant Sonar documentation:
- Web API overview: https://docs.sonarsource.com/sonarqube-cloud/advanced-setup/web-api
- API entry point documentation: https://sonarcloud.io/web_api
