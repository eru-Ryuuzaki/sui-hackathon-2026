# Integrate External Claude Skills

I will integrate the skills from `superpowers`, `sui-dev-skill`, and `anthropics/skills` into your current environment. Since Trae supports the skill concept (similar to Claude), we can directly adapt these.

## 1. Environment Setup

* Create a local directory `external_skills` to host the repositories.

* Clone the following repositories:

  * `https://github.com/obra/superpowers`

  * `https://github.com/Nebryx/sui-dev-skill/`

  * `https://github.com/anthropics/skills`

## 2. Analysis & Extraction

* Inspect the `SKILL.md` files and directory structures in each repository.

* Identify the core instructions and capabilities defined in each skill.

  * **Sui Dev Skill**: Extract the Move/Sui development guidelines.

  * **Superpowers**: Extract the workflow and agentic capabilities.

  * **Anthropic Skills**: Scan for relevant skills (e.g., coding, general utilities) suitable for your project.

## 3. Skill Registration

* Use the **`skill-creator`** tool to create and register the new skills in Trae.

* I will transfer the prompts and configurations from the `SKILL.md` files into Trae's skill system.

  * Register `sui-dev` skill.

  * Register `superpowers` skill.

  * Register selected skills from the Anthropic collection.

## 4. Verification

* Verify that the new skills are successfully loaded and available for use.

