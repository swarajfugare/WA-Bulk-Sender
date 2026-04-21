# WA Bulk Sender Free

Free Chrome extension for sending personalized WhatsApp messages from `web.whatsapp.com` without any premium gate, login wall, or paid unlock flow.

## Current version

`0.9.0`

## What changed in 0.9.0

- Kept the redesigned studio page and WhatsApp-side floating monitor
- Added a circular local restriction-risk estimate on the studio page and inside the WhatsApp monitor
- Added manual known block/report inputs so the estimate can include real feedback you already know
- Added an explanation-driven risk model that reacts to pacing, volume, failures, consent coverage, and message style
- Added stronger preflight safety checks with risk notes before a run starts
- Added daily send caps tracked from local campaign history
- Added positive-consent-only mode for imported leads with consent fields
- Added automatic skipping for recipients that look opted out or explicitly negative on consent
- Added stop-after-consecutive-failures and failure-rate stop controls
- Tightened the default pacing and warm-up profiles to be more conservative
- Prevented starting a second campaign while one is already active
- Added `Export Failed` results for easier review of failures
- Added saved audience presets for repeat testing
- Added `Load Failed As Audience` so failed numbers can be reviewed and retried more carefully
- Added campaign name support into result exports

## Features

- Send to manual numbers, imported lists, chats, contacts, groups, labels, and country-based audiences
- Import recipients from `CSV`, `TXT`, or `XLSX`
- Use placeholders like `{{FirstName}}`, `{{Name}}`, and `{{WhatsApp Number}}`
- Attach images, video, audio, documents, stickers, and voice notes
- Use the message as the first attachment caption when supported
- Show a live campaign monitor directly inside WhatsApp Web while sending
- Show a local restriction-risk estimate using campaign pace, failures, consent coverage, and manual feedback counts
- Pause, resume, stop, and recover jobs while WhatsApp Web stays open
- Add random delays, batch pauses, daily caps, and failure-based stop guards
- Skip excluded numbers before starting a run
- Limit recipients per run and stop automatically after chosen failure thresholds
- Review safety guidance before launch, including consent coverage and local daily usage
- Enter known user block/report counts manually if you track them outside WhatsApp Web
- Save reusable templates locally
- Export result logs as `CSV`

## How to load it in Chrome

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select `/Users/swarajfugare/Downloads/Code/wa-sender`

## Recommended workflow

1. Load the extension and click the popup
2. Open the full studio page
3. Open WhatsApp Web and log in completely
4. Refresh WhatsApp data if you want chats, contacts, groups, labels, or countries
5. Choose your audience
6. Paste or write the message
7. Optionally import a file, add attachments, and tune delays
8. Review the safety summary, daily cap, and consent notes
9. Start the run and keep WhatsApp Web open

## Import format

Use the built-in template download if you want a ready-made starter file.

Minimum required column:

- `WhatsApp Number`

Optional columns become variables:

- `FirstName`
- `LastName`
- `Name`
- `CustomField`

Example:

```csv
WhatsApp Number,FirstName,LastName,CustomField
+15551234567,Alex,Rivera,Spring Offer
```

Message example:

```text
Hello {{FirstName}}, your {{CustomField}} is ready.
```

## Notes

- Keep `https://web.whatsapp.com/` open while a job is running
- Group, label, and country sends expand to direct recipients and are de-duplicated before sending
- Local campaign history is used to estimate how much you already attempted today under the current cap
- The restriction-risk percentage is only a local estimate and not an official WhatsApp score
- The build is fully local and does not include upgrade, premium, payment, or login-gating logic
