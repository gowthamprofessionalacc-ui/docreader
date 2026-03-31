# Product Team Standup — March 10, 2025

## Attendees
Marlion (Founder), Priya (Lead Engineer), Karthik (ML Engineer), Deepa (Product Manager), Ravi (DevOps)

## Sprint Progress (Sprint 14)
- Velocity: 18 story points completed (target was 24)
- Carry-over: 3 stories moved to Sprint 15

## Updates by Team Member

### Priya — Backend
- Completed the WebSocket integration for real-time sensor data streaming
- PR #247 merged: database migration for the new attestation schema
- Blocker: EZVIZ camera API rate limiting causing test failures

### Karthik — ML Pipeline
- YOLOv11n model fine-tuned for ball detection — accuracy improved from 72% to 86%
- CUDA acceleration working on the laptop GPU (RTX 3060)
- Next: homography calibration for camera-to-projector mapping

### Deepa — Product
- User research interviews completed with 5 field officers from Angel One and Zerodha
- Key finding: field officers want Telegram notifications, not email
- Updated the Ashwini agent spec to prioritize Telegram integration

### Ravi — DevOps
- Migrated CI/CD from Jenkins to GitHub Actions — 40% faster build times
- Set up Prometheus + Grafana monitoring stack on the staging server
- Alert rules configured for API latency > 500ms

## Decisions Made
1. Postpone the public launch of SensorSeal to April 15 (was March 30)
2. Hire 3 new engineers: 1 frontend, 1 ML, 1 full-stack
3. Switch from NEDA helpline to National Alliance for Eating Disorders in our wellness resources page
4. Adopt Telegram as primary notification channel for Ashwini agent

## Action Items
- [ ] Marlion: Finalize the Claude Code mega-prompt for the basketball game detection pipeline
- [ ] Priya: Investigate EZVIZ rate limit workaround by Wednesday
- [ ] Karthik: Prepare homography calibration demo for Friday
- [ ] Deepa: Share updated Ashwini spec with the team by Thursday
- [ ] Ravi: Set up staging environment for SensorSeal by March 14

## Next Standup: March 12, 2025
