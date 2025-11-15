# Agent Template System - Quick Reference

## 🎯 Purpose
Save and restore working agent configurations for testing and development.

## ✅ Working Templates

### Demo Agent - Real-Time SMS
**File:** `templates/demo-agent-template.json`
**Status:** WORKING ✅
**Last Tested:** 2025-11-15

**What it does:** Agent asks for phone number, triggers SMS tool in real-time during call

**To use:**
```bash
node scripts/restore-from-template.js
```

---

## 📋 Common Commands

### Restore Working Demo Agent
```bash
# Restore to default marketing agent
node scripts/restore-from-template.js

# Restore to specific agent
node scripts/restore-from-template.js agent_abc123xyz
```

### Backup Current Agent
```bash
# Quick backup
node scripts/backup-agent-to-template.js

# Named backup with description
node scripts/backup-agent-to-template.js agent_9701k9xptd0kfr383djx5zk7300x "my-backup" "Before major changes"
```

### Check Current Config
```bash
node scripts/check-agent-config.js
```

---

## 🔧 Template Features

**Included in Templates:**
- ✅ Full agent prompt
- ✅ Tool configurations
- ✅ First message
- ✅ TTS settings
- ✅ Language settings
- ✅ Testing instructions

**Not Included (Configure Separately):**
- Backend webhook handlers
- Environment variables
- Twilio/SMS configuration

---

## 🚀 Workflow

### Before Making Changes
```bash
# 1. Backup working agent
node scripts/backup-agent-to-template.js agent_9701k9xptd0kfr383djx5zk7300x "working-before-changes"

# 2. Make your changes to the agent

# 3. If something breaks, restore
node scripts/restore-from-template.js agent_9701k9xptd0kfr383djx5zk7300x working-before-changes
```

### Creating New Agent Types
```bash
# 1. Configure agent in ElevenLabs dashboard or via scripts

# 2. Test thoroughly

# 3. Backup as template
node scripts/backup-agent-to-template.js agent_new123 "new-agent-type" "Description of what it does"

# 4. Document in templates/README.md
```

---

## 📊 Template Status Codes

- `WORKING ✅` - Tested and working perfectly
- `EXPERIMENTAL 🧪` - New, needs more testing
- `BROKEN ❌` - Known issues, don't use
- `DEPRECATED 🗑️` - Old, better version available

---

## 🎓 Best Practices

1. **Always test after restore** - Don't assume it works
2. **Keep working versions** - Don't overwrite templates that work
3. **Date your backups** - `agent-backup-2025-11-15`
4. **Document changes** - Update template description
5. **Test with real calls** - Not just configuration checks

---

## 🆘 Quick Recovery

**Agent broken? Restore last working version:**
```bash
node scripts/restore-from-template.js
```

**Need to compare configs?**
```bash
node scripts/check-agent-config.js
```

**Can't remember what changed?**
```bash
cat scripts/templates/demo-agent-template.json
```

---

## 📁 Files

- `templates/` - Saved agent configurations
- `templates/README.md` - Detailed documentation
- `backup-agent-to-template.js` - Save current agent
- `restore-from-template.js` - Load template
- `check-agent-config.js` - View current config

---

## 💡 Tips

- Restore demo template before client demos
- Backup before major prompt changes
- Keep monthly snapshots of working agents
- Test templates in non-production first
- Document any backend changes needed
