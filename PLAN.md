# Fix Sidebar Bottom Cut-off Issue

## The Problem

The admin sidebar's bottom section (with the exit button) is getting cut off on tablets and mobile devices. This happens because the browser's bottom UI takes space that the sidebar doesn't account for.

## The Fix

I'll update the sidebar layout to:

1. **Add safe area padding** at the bottom to account for browser UI on tablets/phones
2. **Make the content scrollable** if it overflows (for smaller screens)
3. **Use dynamic viewport height** (`dvh`) which accounts for mobile browser UI

## Visual Result

After the fix:
- The exit button will be fully visible
- The sidebar will work properly on all devices (desktop, tablet, phone)
- If the screen is very short, users can scroll the sidebar

## Changes

One file will be updated: the admin sidebar component to improve its responsive layout.