# Skill Migration & Optimization Plan

I will refactor the skill integration process to systematically harvest, de-duplicate, and optimize all skills from the target repositories (`superpowers`, `sui-dev-skill`, `anthropics/skills`).

## 1. Cleanup & Preparation
*   **Remove Existing Skills**: Delete the previously created single-file skills in `.trae/skills/` (`sui-move`, `using-superpowers`, `frontend-design`) to start fresh.
*   **Clean Workspace**: Empty the `external_skills` directory.

## 2. Comprehensive Harvesting (Git Clone)
*   I will clone the full repositories to ensure I have access to **ALL** defined skills, not just the ones I manually picked.
*   **Repositories**:
    *   `https://github.com/obra/superpowers`
    *   `https://github.com/Nebryx/sui-dev-skill`
    *   `https://github.com/anthropics/skills`
*   *Note*: I will use `git clone --depth 1` to minimize download size and potential timeouts.

## 3. Extraction & Analysis
*   **Traversal**: I will traverse the directories of each cloned repo to locate all `SKILL.md` files.
*   **Metadata Extraction**: For each discovered skill, I will extract:
    *   **Name**: From YAML frontmatter or directory name.
    *   **Description**: From YAML frontmatter.
    *   **Content**: The full implementation logic.
    *   **Source**: Which repo it came from.

## 4. Deduplication & Optimization Strategy
I will apply the following logic to handle conflicts and overlaps:

| Scenario | Strategy |
| :--- | :--- |
| **Unique Skill** | Direct migration. |
| **Name Collision** (Different Function) | **Namespace Rename**. (e.g., `test` from Superpowers becomes `sp-test`, `test` from Anthropic becomes `anthropic-test`). |
| **Name Collision** (Same Function) | **Merge**. I will combine the best practices from both into a unified skill, favoring the more detailed implementation (usually Superpowers for workflows, Anthropic for tools). |
| **"Superpowers" Framework** | Skills from the `superpowers` repo are part of a cohesive methodology. I will prefix them with `sp-` (e.g., `sp-brainstorming`) *unless* they are the canonical version (like `using-superpowers`), to avoid confusion with general skills. |

## 5. Migration Execution
*   **Destination**: `.trae/skills/<skill-name>/SKILL.md`.
*   **Reference Handling**: I will also copy any `references/` or `scripts/` directories associated with the skills to ensure they work offline.

## 6. Reporting
*   Generate a `SKILL_MIGRATION_REPORT.md` containing:
    *   Total skills found.
    *   List of migrated skills (Source -> Target).
    *   Details of any merges or renames performed.

## 7. Verification
*   Verify the final skill list using `ls .trae/skills`.
