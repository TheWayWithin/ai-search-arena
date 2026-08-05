# CLAUDE.md

Framework rules (Karpathy constitution, mission routing, tracking-file protocols, MCP, hooks, security) live in `.claude/CLAUDE.md`. Read both. This file is the product layer.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines

**The user has ADHD and specific communication needs. Always follow this structure:**

### Response Format
1. **Brief Context** (1-2 sentences max) - Explain what we're doing and why it matters
2. **Exact Instructions** - Clear numbered steps from where the user currently is (e.g., "You're on the GitHub page, now click...")
3. **Completion Check** - Ask if they've completed the step and want to continue

### Critical Rules
- **No information overload** - Keep explanations brief, instructions specific
- **Start from current state** - Don't assume they finished previous steps unless confirmed
- **One step at a time** - Provide closure before moving to next task (reduces anxiety)
- **Plain language** - Avoid technical jargon, be specific about what to click/type/enter
- **Explain why briefly** - 1-2 sentences on purpose to maintain focus and motivation
- **Offer choices clearly** - When decisions needed, present 2-3 options with clear pros/cons
- **Check for overwhelm** - If user seems stuck, pause and offer: recap, break, or refocus
- **Provide recaps** - Briefly summarize where we are and what we've accomplished when needed

### Example Response Structure
```
Context: We're setting up your Railway account so your trading system can deploy automatically.

Instructions:
1. Go to https://railway.app
2. Click the "Start a New Project" button in the top right
3. Choose "Deploy from GitHub repo"

Have you completed these steps? Ready to continue?
```

**Remember**: The user has poor short-term memory, so continuity from previous step is essential. Don't jump ahead.

## Project Overview

AGENT-11 is a framework for deploying specialized AI agents in Claude Code to form an elite development squad. The project provides templates, documentation, and deployment guides for 11 specialized agents that collaborate to help solo founders build and ship products rapidly.

## Critical Software Development Principles

### Strategic Solutions, Not Hacks
**This is a smart trading engine, not a proposal generator.** When facing problems:

1. **Never propose hack solutions**
   - No hardcoded magic numbers without data justification
   - No workarounds that bypass the intended architecture
   - No "quick fixes" that create technical debt
   - No band-aids that treat symptoms instead of root causes

2. **Understand the system's purpose**
   - This engine harnesses LLM intelligence to make informed, profitable trades
   - Each component was chosen for specific capabilities (e.g., DeepSeek for signal generation based on Alpha Arena S1)
   - The goal is consistent profitability through win-rate × risk-reward × position sizing
   - Solutions must enhance the system's intelligence, not constrain it

3. **When something isn't working**
   - Ask "How should this component be used?" not "How do I force output?"
   - Review the original design intent and evaluation criteria
   - Consider if we're using the tool correctly vs. if the tool is broken
   - Gather data to inform decisions, don't guess at thresholds

4. **Data-driven decisions**
   - Configuration values (RSI thresholds, confidence levels, R:R ratios) must be justified by data
   - Use the insights repository to document hypotheses and test them
   - Paper test changes before production deployment
   - Never assume values are "correct" - validate with backtesting

### Security-First Development
**NEVER compromise security for convenience.** When encountering security features or policies:

1. **Understand Before Changing**
   - Research what the security feature does and why it exists
   - Understand the security implications of any changes
   - Find ways to work WITH security features, not around them
   - Example: `strict-dynamic` in CSP exists to prevent XSS attacks - use nonces properly instead of removing it

2. **Root Cause Analysis**
   - Ask "Why was this designed this way?" before making changes
   - Look for the architectural intent behind existing code
   - Consider the broader system impact of changes
   - Don't just fix symptoms - understand and address root causes

3. **Strategic Solution Checklist**
   Before implementing any fix, verify:
   - ✅ Does this maintain all security requirements?
   - ✅ Is this the architecturally correct solution?
   - ✅ Will this create technical debt?
   - ✅ Are there better long-term solutions?
   - ✅ Have I understood the original design intent?

4. **Common Anti-Patterns to Avoid**
   - ❌ Removing security features to "make things work"
   - ❌ Adding `any` types to bypass TypeScript errors
   - ❌ Using `@ts-ignore` without understanding the issue
   - ❌ Disabling linters or security scanners
   - ❌ Implementing quick fixes that break design patterns

5. **When Facing Issues**
   - PAUSE: Don't rush to implement the first solution
   - RESEARCH: Understand the system design and constraints
   - PROPOSE: Present multiple solutions with trade-offs
   - IMPLEMENT: Choose the solution that maintains system integrity
   - DOCUMENT: Record why decisions were made for future reference

### CRITICAL: Authorization Required for All Changes
**NEVER implement code changes without explicit user authorization.** This is the most important rule in this entire document.

**The Problem**: Unauthorized implementations have prevented this trading system from executing trades for 14+ days, causing significant lost opportunity and user frustration.

1. **Questions Are NOT Requests**
   - User asks "Why not do X?" → ANSWER the question, DO NOT implement X
   - User asks "Should we do Y?" → EXPLAIN options, DO NOT implement Y
   - User asks "What about Z?" → DISCUSS implications, DO NOT implement Z
   - **ONLY implement when user says**: "Yes, do it", "Implement this", "Make that change", "Go ahead"

2. **Always Explain BEFORE Acting**
   - Describe WHAT you will change (specific files, lines, logic)
   - Explain WHY the change is needed (root cause, architectural benefit)
   - Outline WHAT WILL HAPPEN when the change is deployed (behavior changes, risks)
   - State EXPECTED OUTCOME (what success looks like)
   - **Then WAIT for explicit "yes" before implementing**

3. **Authorization Confirmation Template**
   ```
   I propose implementing [CHANGE NAME]:

   What I'll change:
   - File: [path] Line: [number]
   - Current behavior: [description]
   - New behavior: [description]

   Why this is needed:
   - Root cause: [explanation]
   - Architectural benefit: [explanation]

   What will happen when deployed:
   - [Specific behavior change 1]
   - [Specific behavior change 2]
   - Potential risks: [list any risks]

   Expected outcome:
   - [Measurable success criteria]

   Should I implement this change? (yes/no)
   ```

4. **When User Asks Questions About Changes**
   - "Why not do sprint 65 now?" → Answer with reasoning (e.g., "Sprint 65 makes sense because [architectural benefits], but we should verify Sprint 64 hotfix works first because [risk of stacking changes]")
   - "Should we refactor this?" → Explain trade-offs (e.g., "Refactoring would improve [benefit] but requires [effort/risk]. We could also [alternative]. Which approach do you prefer?")
   - "What about moving this logic?" → Discuss implications (e.g., "Moving it would align with [principle] but would affect [components]. The change would [behavior impact].")

5. **Consequences of Unauthorized Changes**
   - **14 days of zero trades** due to accumulated unauthorized "improvements"
   - Complex debugging to identify which unauthorized change broke what
   - Loss of user trust in the AI's judgment
   - Wasted development time fixing problems caused by unauthorized changes

6. **The ONLY Exceptions**
   - Analysis and investigation (reading files, logs, searching for patterns)
   - Creating documentation (insights, sprint specs, bug reports)
   - Answering questions with explanations
   - **Everything else requires explicit authorization**

**Remember**: This trading system's purpose is to make profitable trades. Every unauthorized change is a potential blocker that prevents trades from executing. Analysis and discussion are always welcome. Implementation requires authorization.

## Architecture

This is a documentation-based project with the following structure:

- `/project/agents/` - Agent profiles and deployment commands
  - `core-squad.md` - 4 essential agents for getting started
  - `full-squad.md` - All 11 specialized agents
  - `specialists/` - Individual agent profiles with detailed capabilities
- `/project/field-manual/` - User guides and best practices
  - `architecture-sop.md` - Comprehensive architecture documentation guidelines
- `/project/missions/` - Predefined workflows and operation guides
- `/project/community/` - Success stories and user contributions
- `/templates/` - Reusable templates for common scenarios
  - `architecture.md` - Production-ready architecture documentation template

## Agent Deployment System

The core functionality involves deploying agents to Claude Code's `.claude/agents/` directory. The agents are then available via the `@` command:

```bash
# After installation, agents are available as:
@strategist Create user stories for our feature
@developer Implement the authentication system
@tester Validate the implementation
@operator Prepare for deployment

# NEW: Mission-based orchestration
/coord build requirements.md    # Orchestrate full build mission
/coord fix bug-report.md       # Quick bug fix mission
/coord mvp vision.md          # MVP development mission
```

## Key Components

### Core Squad (Minimum Viable Team)
1. **The Strategist** - Product strategy and requirements
2. **The Developer** - Full-stack implementation 
3. **The Tester** - Quality assurance
4. **The Operator** - DevOps and deployment

### Full Squad (11 Specialists)
Includes the core squad plus:
- The Architect (system design)
- The Designer (UX/UI)
- The Documenter (technical writing)
- The Support (customer success)
- The Analyst (data insights)
- The Marketer (growth)
- The Coordinator (mission orchestration)

## Development Guidelines

- This is a documentation-first project with no build system or package.json
- All content is in Markdown format
- Agent profiles follow a consistent structure with deployment commands, capabilities, and collaboration protocols
- Documentation uses military/tactical metaphors consistently
- Focus on actionable, practical guidance for solo founders
- **CRITICAL**: All agents must follow the Critical Software Development Principles above
- Security-first mindset required for all development decisions
- Root cause analysis mandatory before implementing fixes

## File Editing Conventions

- Maintain the consistent tone and military theme throughout
- Agent profiles should include deployment commands, capabilities, collaboration protocols, and real examples
- Use consistent formatting with emoji indicators for different sections
- Keep deployment commands as single-line strings for easy copy/paste
- Include practical examples and workflows in documentation

## Ideation File Concept

The ideation file is a centralized document containing all requirements, context, and vision for a development project. This can include:
- Product Requirements Documents (PRDs)
- Brand guidelines
- Architecture specifications
- Vision documents
- User research
- Market analysis
- Technical constraints

### Standard Location
- Primary: `./ideation.md`
- Alternative: `./docs/ideation/`
- Can be multiple files referenced in CLAUDE.md

## Progress Tracking System

### Core Tracking Files

1. **project-plan.md** - Strategic roadmap and milestones (FORWARD-LOOKING)
   - Executive summary, objectives, technical architecture
   - Task lists with checkboxes [ ] → [x]
   - Milestone timeline, success metrics, risk assessment
   - **Purpose**: What we're PLANNING to do
   - **Update when**: Mission start, phase start, task completion

2. **progress.md** - Chronological changelog and issue learning repository (BACKWARD-LOOKING)
   - Deliverables created/updated with descriptions
   - Changes made to code, configs, documentation
   - **Complete issue history**: ALL attempted fixes (not just final solution)
   - Root cause analysis and prevention strategies
   - Patterns and lessons learned from failures
   - **Purpose**: What we DID and what we LEARNED (especially from failures)
   - **Update when**: After each deliverable, after EACH fix attempt, when issue resolved

### Update Protocol

**For project-plan.md** (The Plan):
1. **Mission Start**: Create with all planned tasks marked [ ]
2. **Phase Start**: Add phase-specific tasks before work begins
3. **Task Completion**: Mark [x] ONLY after specialist confirms done
4. **Keep Current**: Update to reflect actual vs planned progress

**For progress.md** (The Changelog):
1. **After Each Deliverable**: Log what was created/changed with description
2. **When Issue Encountered**: Create issue entry immediately with symptom and context
3. **After EACH Fix Attempt**: Log attempt, rationale, result (✅ or ❌), and learning
4. **When Issue Resolved**: Add root cause analysis and prevention strategy
5. **End of Phase**: Add lessons learned and patterns recognized

**Critical**: Document FAILED attempts, not just successes. Failed attempts teach us what doesn't work and why.

**For CLAUDE.md** (The System):
3. ⚡ Record permanent process improvements and system-level learnings

## Performance Baseline System (Sprint 106)

Trader-7 supports a **soft metrics reset** via a baseline marker stored in `system_config`. This lets us track "since baseline" metrics alongside all-time stats without losing historical data.

### How It Works
- `baseline_trade_id` in `system_config` marks the last trade BEFORE the reset point
- Metrics for trades with `id > baseline_trade_id` are calculated separately
- Both all-time and since-baseline metrics appear in logs (Phase 7) and dashboard overview

### How to Reset the Baseline
To set a new baseline (e.g., after a major system change):

1. Find the current latest trade ID:
   ```sql
   SELECT MAX(id) FROM trades;
   ```
2. Update the baseline in `system_config`:
   ```sql
   UPDATE system_config SET value = '<NEW_TRADE_ID>', updated_at = strftime('%s','now') WHERE key = 'baseline_trade_id';
   UPDATE system_config SET value = '<NEW_LABEL>', updated_at = strftime('%s','now') WHERE key = 'baseline_label';
   UPDATE system_config SET value = '<CURRENT_PNL>', updated_at = strftime('%s','now') WHERE key = 'baseline_pnl';
   UPDATE system_config SET value = '<CURRENT_TRADE_COUNT>', updated_at = strftime('%s','now') WHERE key = 'baseline_trade_count';
   ```
   Or via code: `self.db.config.set('baseline_trade_id', str(new_id))`

### Key Files
- **Migration**: `src/database/migrations/versions/044_insert_performance_baseline.sql`
- **Query methods**: `trade_repository.py` — `get_total_realized_pnl_since()`, `get_closed_trades_since()`
- **Log output**: `main.py` — `_update_metrics()` shows "Since {label}" section
- **Dashboard**: `overview.py` — `_get_baseline_metrics()` renders KPI row

### Current Baseline
- **Set**: 2026-03-07 (Sprint 106 deploy)
- **Label**: "Sprint 106"
- **Baseline trade ID**: 183 (88 closed trades, PnL -$31.28 at time of reset)

## Insights Repository System

### Purpose

The `insights/` repository captures learnings, hypotheses, and testing methodologies as we operate and optimize the trading system. This creates a knowledge base that drives data-driven decision making and continuous improvement.

### When to Create an Insight

Create a new insight document when you discover:
- **Configuration Optimization Opportunity**: Better values for system parameters (R:R ratio, position sizing, stop loss ranges, etc.)
- **Strategy Effectiveness Pattern**: Market conditions or approaches that consistently work/don't work
- **Risk Management Learning**: Capital preservation patterns or drawdown behaviors
- **Performance Bottleneck**: System inefficiencies or optimization opportunities
- **Market Analysis Finding**: Regime patterns, correlations, or behavioral insights

**Trigger**: When analysis reveals a potential improvement worth testing, or when we learn something significant from live trading results.

### Insight Creation Protocol

1. **Identify the Category**:
   - `insights/configuration/` - System parameters
   - `insights/strategy/` - Trading approach effectiveness
   - `insights/risk-management/` - Capital preservation
   - `insights/performance/` - System optimization
   - `insights/market-analysis/` - Market patterns

2. **Create Document** (`insights/[category]/[descriptive-name].md`):
   ```markdown
   # [Insight Title]

   **Date**: YYYY-MM-DD
   **Category**: [Configuration/Strategy/Risk/Performance/Market]
   **Status**: Hypothesis | Testing | Validated | Rejected
   **Priority**: Critical | High | Medium | Low

   ## 1. Hypothesis
   [What we believe and why - clear, testable statement]

   ## 2. Supporting Analysis
   [Data, calculations, reasoning that led to this hypothesis]

   ## 3. Testing Methodology
   [How to validate - backtest, paper test, A/B test]

   ## 4. Results
   [Outcomes when tested - update this section with findings]

   ## 5. Recommendations
   [What to do based on analysis/results]

   ## 6. Decision Log
   | Date | Decision | Reasoning | Outcome |
   |------|----------|-----------|---------|
   | YYYY-MM-DD | [Action taken] | [Why] | [Result] |
   ```

3. **Reference in Relevant Files**:
   - Add to `progress.md` when insight is created
   - Add to `project-plan.md` if it spawns a testing task
   - Reference in code comments if it affects implementation

4. **Update Status as Testing Progresses**:
   - **Hypothesis**: Initial documentation
   - **Testing**: Active validation (paper test, A/B test)
   - **Validated**: Proven effective, adopted into production
   - **Rejected**: Tested and disproven, document why

### Example: Configuration Insight

When we discover that the R:R ratio mismatch was causing rejections, we:
1. **Identify**: Configuration issue affecting approval rate
2. **Document**: Create `insights/configuration/risk-reward-optimization.md`
3. **Analyze**: Math shows 3.0:1 for perpetuals may be better than 3.5:1
4. **Test Plan**: 3-phase approach (backtest → paper test → A/B test)
5. **Track**: Update with results as testing completes

### Integration with Parallel Paper Testing

Insights drive what we test:
- Document hypothesis in `insights/` first
- Design test in `docs/parallel-paper-testing-system.md`
- Execute test post-live
- Update insight document with results
- Make data-driven configuration decision

### Best Practices

- **Be Specific**: "3.0:1 R:R for perpetuals" not "better R:R"
- **Show Math**: Include calculations that support hypothesis
- **Define Success**: Clear metrics for validation (e.g., "≥20% improvement")
- **Document Failures**: Rejected insights teach us what doesn't work
- **Keep Updated**: Add results as testing progresses
- **Cross-Reference**: Link related insights together

### Proactive Insight Capture

When working on the trading system, actively look for:
- Patterns in proposal rejections (analytics dashboard)
- Configuration values that seem suboptimal
- Trade results that suggest strategy improvements
- System behaviors that could be more efficient
- Market conditions that consistently affect performance

**Remember**: Every insight is an opportunity to make the system smarter. Document them systematically.

## Design Review System

For UI/UX projects, AGENT-11 includes design review capabilities:
- **@designer**: Enhanced with comprehensive UI/UX assessment
- **@design-review**: Dedicated agent for design audits (when available)
- **Standards**: Live environment testing, evidence-based feedback

*Note: For project-specific design principles, add them to your project's CLAUDE.md file. See `/templates/` for design principles template.*

## Mission Documentation Standards

### Mandatory Tracking Files

For all missions, coordinators MUST maintain:
- **project-plan.md**: Strategic roadmap with task completion tracking
- **progress.md**: Issues, resolutions, and lessons learned
- **architecture.md**: System design and architecture decisions (for kickoff missions)
- **Templates**: Available in `/templates/` directory

### Architecture Documentation
- **Template**: `/templates/architecture.md` - Production-ready template with examples
- **SOP**: `/project/field-manual/architecture-sop.md` - Comprehensive guidelines
- **When Created**: During dev-setup (new projects) or dev-alignment (existing projects)

### Critical Requirements
1. Update files immediately when issues occur or phases complete
2. Mark tasks complete [x] only after specialist confirmation
3. Log all problems for future learning
4. Both files mandatory before proceeding to next phase

## Context Preservation System

### Overview
AGENT-11 implements a comprehensive context preservation system inspired by BOS-AI's proven approach, ensuring zero context loss across multi-agent workflows. This system maintains continuity through persistent context files and mandatory handoff protocols.

### Core Context Files

#### 1. agent-context.md
- **Purpose**: Rolling accumulation of all findings, decisions, and critical information
- **Location**: `/agent-context.md` (mission root)
- **Updated By**: Coordinator after each agent task
- **Contains**: Mission objectives, accumulated findings, technical decisions, known issues, dependencies

#### 2. handoff-notes.md  
- **Purpose**: Specific context for the next agent in workflow
- **Location**: `/handoff-notes.md` (mission root)
- **Updated By**: Each agent before task completion
- **Contains**: Immediate task, critical context, warnings, specific instructions, test results

#### 3. evidence-repository.md
- **Purpose**: Centralized collection of artifacts and supporting materials
- **Location**: `/evidence-repository.md` (mission root)
- **Updated By**: Any agent producing evidence
- **Contains**: Screenshots, code snippets, test results, API responses, error logs

### Context Preservation Protocol

#### Before Task Execution
1. Agent MUST read `agent-context.md` and `handoff-notes.md`
2. Agent acknowledges understanding of objectives and constraints
3. Agent identifies relevant prior work and decisions

#### During Task Execution
1. Agent maintains awareness of mission context
2. Agent aligns work with documented decisions
3. Agent captures new findings and decisions

#### After Task Completion
1. Agent updates `handoff-notes.md` with findings for next agent
2. Agent adds evidence to `evidence-repository.md` if applicable
3. Coordinator merges findings into `agent-context.md`

### Enforcement Mechanisms

#### Coordinator Enforcement
- Coordinator includes context reading requirement in every Task tool delegation
- Coordinator verifies handoff documentation before marking tasks complete
- Coordinator maintains context file integrity throughout mission

#### Delegation Template
```
Task(
  subagent_type="developer",
  prompt="First read agent-context.md and handoff-notes.md for mission context.
          CRITICAL: Follow the Critical Software Development Principles - never compromise security for convenience, perform root cause analysis before fixes.
          [Specific task instructions]. 
          Update handoff-notes.md with your findings and decisions for the next specialist."
)
```

### Benefits
- **87.5% reduction in rework** - Agents build on prior work effectively
- **37.5% faster completion** - No time lost to context reconstruction  
- **Zero context loss** - All decisions and findings preserved
- **Complete audit trail** - Full history of mission evolution
- **Pause/resume capability** - Missions can be interrupted and continued

### Templates
Context preservation templates are available in `/templates/`:
- `agent-context-template.md` - Mission-wide context accumulator
- `handoff-notes-template.md` - Agent-to-agent handoff structure
- `evidence-repository-template.md` - Artifact collection format

## Coordinator Delegation Protocol

### CRITICAL: Using /coord Command

When using `/coord` to orchestrate missions, the coordinator MUST use the Task tool for actual delegation:

1. **Task Tool Usage (CORRECT)**:
   - The coordinator must call the Task tool with proper parameters
   - Example: `Task(subagent_type="developer", description="Fix auth", prompt="Detailed instructions...")`
   - This actually spawns a new agent instance that performs the work

2. **@agent Syntax (INCORRECT)**:
   - Never use `@agent` syntax in coordinator prompts - this is just text output
   - `@developer` is for users to invoke agents directly, not for internal delegation
   - Writing "Delegating to @developer" does NOT actually delegate anything

3. **Verification Protocol**:
   - Coordinator must confirm Task tool was actually called
   - Look for "Using Task tool with subagent_type='[agent]'" in output
   - If you see "Delegating to @agent" without Task tool usage, delegation didn't happen

4. **Example of Proper Delegation**:
   ```
   # WRONG (just describes delegation):
   "I'm delegating to @tester for testing"
   
   # RIGHT (actually uses Task tool):
   Task(
     subagent_type="tester",
     description="Test auth flow",
     prompt="Create Playwright tests for authentication..."
   )
   ```

### NO ROLE-PLAYING RULE
The coordinator must NEVER role-play or simulate delegation. Every delegation must be an actual Task tool invocation that spawns a real agent instance. Status updates should reflect actual Task tool responses, not imagined agent responses.

### CONTEXT PRESERVATION REQUIREMENT
Every Task tool invocation MUST include instructions to read context files first and update handoff notes after completion. This ensures seamless context flow between agents.

### PRINCIPLE ENFORCEMENT IN DELEGATION
Every Task tool delegation MUST remind agents to:
- Follow Critical Software Development Principles
- Never compromise security for convenience
- Perform root cause analysis before implementing fixes
- Document strategic decisions in handoff-notes.md

## Common Tasks

### Project Initialization

#### Greenfield Projects (New)
```bash
/coord dev-setup ideation.md
```
- Sets up GitHub repository
- Analyzes ideation documents
- Creates architecture.md from template
- Creates project-plan.md
- Initializes progress.md
- Configures CLAUDE.md

#### Existing Projects (Brownfield)
```bash
/coord dev-alignment
```
- Analyzes existing codebase
- Understands project context
- Reviews/creates architecture.md
- Creates/updates tracking files
- Optimizes CLAUDE.md for project

### Adding New Agent Profiles
1. Create new file in `/project/agents/specialists/`
2. Follow existing template structure
3. Update `/project/agents/full-squad.md` with new agent
4. Add deployment command to relevant quick-start guides

### Updating Documentation
- Maintain consistency with existing tone and structure
- Focus on practical, actionable content
- Include real-world examples and workflows
- Keep military/tactical metaphors throughout

### Content Guidelines
- Write for solo founders and non-technical founders
- Emphasize speed, efficiency, and practical results
- Include specific commands and examples
- Maintain the "elite squad" branding throughout
- **ESSENTIAL**: Reference Critical Software Development Principles in all agent guidance
- Ensure security-first development is emphasized in all documentation

## MCP (Model Context Protocol) Integration

### MCP-First Principle
Agents should prioritize using available MCP servers before implementing functionality manually. This ensures efficiency, consistency, and leverages proven implementations.

### MCP Discovery Protocol
1. **Check Available MCPs**: Use `grep "mcp__"` or look for tools starting with `mcp__` prefix
2. **Prioritize MCP Usage**: Always check if an MCP can handle the task before manual implementation
3. **Document MCP Usage**: Track which MCPs are used in project-plan.md and CLAUDE.md
4. **Fallback Strategy**: Have manual approach ready when specific MCPs aren't available

### MCP Tool Categories

#### Infrastructure & Deployment
- **mcp__railway** - Backend services, databases, cron jobs, workers, auto-scaling
- **mcp__netlify** - Frontend hosting, edge functions, forms, redirects
- **mcp__vercel** - Alternative frontend hosting with serverless functions
- **mcp__supabase** - Managed Postgres, auth, real-time, storage, edge functions

#### Commerce & Payments
- **mcp__stripe** - Payments, subscriptions, invoicing, revenue analytics, webhooks
- **mcp__paddle** - Alternative payment processor (if available)
- **mcp__shopify** - E-commerce platform integration (if available)

#### Development & Version Control
- **mcp__github** - PRs, issues, releases, CI/CD with Actions, project boards
- **mcp__gitlab** - Alternative version control (if available)
- **mcp__bitbucket** - Alternative version control (if available)

#### Documentation & Knowledge
- **mcp__context7** - Library documentation, code patterns, best practices
- **mcp__context7__resolve-library-id** - Find correct library identifiers
- **mcp__context7__get-library-docs** - Retrieve up-to-date documentation

#### Testing & Quality Assurance
- **mcp__playwright** - Complete browser automation suite:
  - Browser navigation, interaction, screenshots
  - Cross-browser testing (Chrome, Firefox, Safari)
  - Visual regression testing
  - Accessibility testing
  - Performance monitoring

#### Code Search & Research
- **mcp__grep** - Search 1M+ GitHub repositories for:
  - Code patterns and implementations
  - Architecture examples in production
  - Test patterns and edge cases
  - Documentation structures
  - Error handling patterns
  - Example usage: `grep_query("async def", language="Python", repo="fastapi/fastapi")`

#### Research & Analysis
- **mcp__firecrawl** - Web scraping, competitor analysis, market research
- **WebSearch** - Current events, trends, real-time information
- **WebFetch** - Specific page analysis and content extraction

#### Communication & Support
- **mcp__slack** - Team communication (if available)
- **mcp__discord** - Community management (if available)
- **mcp__intercom** - Customer support (if available)

### MCP Usage Pattern

**Standard Workflow**: Always check for relevant MCPs first:
1. **Research**: Use mcp__grep for existing implementations
2. **Documentation**: Use mcp__context7 for official docs  
3. **Services**: Use service-specific MCPs (mcp__supabase, mcp__stripe, etc.)
4. **Testing**: Use mcp__playwright for browser automation
5. **Fallback**: Manual implementation only when MCPs unavailable

### MCP Integration in Missions
All missions should include an MCP discovery phase:
1. Identify available MCPs at mission start
2. Map MCPs to mission tasks
3. Include MCP usage in execution plans
4. Document MCPs used for future reference

### Agent Tool Specification Standards

All agent profiles should explicitly list their available tools:
- **Primary MCPs**: Service-specific tools (e.g., mcp__supabase, mcp__stripe)
- **Core Tools**: Essential Claude Code tools (Edit, Read, Bash, etc.)
- **Fallback Tools**: Alternatives when MCPs unavailable

*See `/templates/agent-creation-mastery.md` for complete tool specification format and agent-specific tool sets.*

## MCP (Model Context Protocol) Setup

### Quick Start
1. **Copy environment template**: `cp .env.mcp.template .env.mcp`
2. **Add your API keys** to `.env.mcp`
3. **Run setup**: `./project/deployment/scripts/mcp-setup.sh`
4. **Verify**: `./project/deployment/scripts/mcp-setup.sh --verify`
5. **Restart Claude Code** for changes to take effect

### MCP Configuration Files
- **`.mcp.json`** - Project-scoped MCP server definitions
- **`.env.mcp`** - API keys and tokens (keep in .gitignore!)
- **`.env.mcp.template`** - Template with all required variables

### Required MCPs for Full Functionality
- **Context7** - Library documentation and code patterns
- **GitHub** - Repository management and PRs
- **Firecrawl** - Web scraping and research
- **Supabase** - Database and authentication
- **Playwright** - Browser automation and testing

### MCP Troubleshooting
- If MCPs don't appear, restart Claude Code
- Check `.mcp-status.md` for connection report
- Verify API keys in `.env.mcp` are correct
- Run `grep "mcp__"` to see available MCP tools

## Available Commands

### Mission Orchestration
- `/coord [mission] [files]` - Orchestrate multi-agent missions
- `/design-review` - Comprehensive UI/UX audit
- `/recon` - Design reconnaissance
- `/meeting [agenda]` - Facilitate structured meetings

### Reporting & Analysis
- `/report [since_date]` - Generate progress reports for stakeholders
- `/pmd [issue]` - Post Mortem Dump for root cause analysis

## Development Notes

- **No Build System**: Pure documentation project - verify changes through Markdown review and deployment testing
- **Mission System**: Use `/coord [mission] [files]` for systematic workflows
- **Templates**: Available in `/templates/` for reusable patterns
- **Updates**: Changes automatically deployed via GitHub integration
