# Notification Bell Functionality & Styling Documentation

## Overview
The notification bell in `MainHeader.tsx` provides a complete notification system with real-time updates, unread indicators, and detailed modal views. This document explains how it functions with all styling details.

---

## Component Structure

### 1. Notification Bell Button


**HTML Structure:**
```tsx
<Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
  <PopoverTrigger asChild>
    <span className="relative flex items-center justify-center bg-white w-[40px] h-[40px] rounded-[10px] shadow-[0px_4px_25px_0px_#0000001A] cursor-pointer hover:bg-gray-50 transition-colors">
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></span>
      )}
    </span>
  </PopoverTrigger>
```

**Styling Details:**

**Container (`<span>`):**
- `relative` - Positioning context for absolute badge
- `flex items-center justify-center` - Centers icon horizontally and vertically
- `bg-white` - White background (#FFFFFF)
- `w-[40px] h-[40px]` - Fixed 40x40px square
- `rounded-[10px]` - 10px border radius
- `shadow-[0px_4px_25px_0px_#0000001A]` - Custom shadow (4px vertical offset, 25px blur, 10% opacity)
- `cursor-pointer` - Pointer cursor on hover
- `hover:bg-gray-50` - Light gray background on hover (#F9FAFB)
- `transition-colors` - Smooth color transitions

**Bell Icon:**
- Component: `BellIcon` from `../icons/icon`
- Size: `h-6 w-6` (24x24px)
- Color: Dark blue (#003465) - defined in BellIcon component

**Unread Badge (conditional):**
- `absolute -top-1 -right-1` - Positioned at top-right corner (-4px offset)
- `bg-red-500` - Red background (#EF4444)
- `rounded-full` - Perfect circle
- `w-3 h-3` - 12x12px size
- Only displays when `unreadCount > 0`

---

### 2. Notification Popover

**Location:** Lines 299-350

**Popover Container:**
```tsx
<PopoverContent className="w-80 p-0" align="end">
```

**Styling:**
- `w-80` - Fixed width of 320px
- `p-0` - No padding on container (padding applied to children)
- `align="end"` - Right-aligned with trigger button

**Popover Header:**
```tsx
<div className="p-4 border-b">
  <h3 className="font-semibold text-lg">Notifications</h3>
</div>
```

**Styling:**
- Container: `p-4` (16px padding), `border-b` (bottom border)
- Title: `font-semibold text-lg` (bold, 18px font size)

**Notifications List Container:**
```tsx
<div className="max-h-96 overflow-y-auto">
```

**Styling:**
- `max-h-96` - Maximum height of 384px
- `overflow-y-auto` - Vertical scrollbar when content exceeds height

**Empty State:**
```tsx
<div className="p-4 text-center text-gray-500">
  No notifications
</div>
```

**Styling:**
- `p-4` - 16px padding
- `text-center` - Centered text
- `text-gray-500` - Medium gray text (#6B7280)

---

### 3. Notification Item

**Location:** Lines 312-335

**HTML Structure:**
```tsx
<div
  key={notification.id}
  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
    isUnread ? "bg-blue-50" : ""
  }`}
  onClick={() => handleNotificationClick(notification)}
>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <p className="font-semibold text-sm text-[#003465]">
        {notification.title}
      </p>
      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
        {notification.message}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ""}
      </p>
    </div>
    {isUnread && (
      <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></span>
    )}
  </div>
</div>
```

**Item Container Styling:**
- `p-4` - 16px padding on all sides
- `border-b` - Bottom border separator
- `cursor-pointer` - Pointer cursor on hover
- `hover:bg-gray-50` - Light gray background on hover (#F9FAFB)
- `transition-colors` - Smooth color transitions
- `bg-blue-50` - Light blue background (#EFF6FF) when unread

**Content Layout:**
- `flex items-start justify-between` - Flexbox layout, items aligned to start, space between
- `flex-1` - Takes remaining available space

**Title Styling:**
- `font-semibold text-sm` - Bold, 14px font size
- `text-[#003465]` - Dark blue color

**Message Styling:**
- `text-xs` - 12px font size
- `text-gray-600` - Medium gray (#4B5563)
- `mt-1` - 4px top margin
- `line-clamp-2` - Clamps to 2 lines with ellipsis

**Date Styling:**
- `text-xs` - 12px font size
- `text-gray-400` - Light gray (#9CA3AF)
- `mt-1` - 4px top margin

**Unread Indicator:**
- `w-2 h-2` - 8x8px size
- `bg-blue-500` - Blue color (#3B82F6)
- `rounded-full` - Perfect circle
- `ml-2` - 8px left margin
- `flex-shrink-0` - Prevents shrinking in flex layout

---

### 4. View All Button

**Location:** Lines 340-349

```tsx
{notifications.length > 0 && (
  <div className="p-3 border-t text-center">
    <button
      className="text-sm text-[#003465] hover:underline"
      onClick={handleViewAllNotifications}
    >
      View all notification
    </button>
  </div>
)}
```

**Styling:**
- Container: `p-3` (12px padding), `border-t` (top border), `text-center` (centered text)
- Button: `text-sm` (14px), `text-[#003465]` (dark blue), `hover:underline` (underline on hover)
- Only displays when `notifications.length > 0`

---

### 5. Notification Detail Modal

**Location:** Lines 354-421

**Modal Overlay:**
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
```

**Styling:**
- `fixed inset-0` - Full screen overlay
- `bg-black bg-opacity-50` - 50% opacity black overlay
- `flex items-center justify-center` - Centers modal
- `z-50` - High z-index (50) to appear above other content
- `p-4` - 16px padding

**Modal Container:**
```tsx
<div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto my-auto max-h-[90vh] overflow-y-auto">
```

**Styling:**
- `bg-white` - White background
- `rounded-lg` - 8px border radius
- `p-6` - 24px padding
- `w-full max-w-2xl` - Full width up to 672px
- `mx-auto my-auto` - Centered horizontally and vertically
- `max-h-[90vh]` - Maximum 90% of viewport height
- `overflow-y-auto` - Vertical scroll when content exceeds height

**Modal Header:**
```tsx
<div className="flex justify-between items-start mb-4">
  <h2 className="text-2xl font-bold text-[#003465] pr-4">
    {selectedNotification.title}
  </h2>
  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 flex-shrink-0">
    <X className="w-5 h-5" />
  </Button>
</div>
```

**Title Styling:**
- `text-2xl` - 24px font size
- `font-bold` - Bold weight
- `text-[#003465]` - Dark blue color
- `pr-4` - 16px right padding

**Close Button:**
- `variant="ghost"` - Ghost button variant
- `size="sm"` - Small size
- `text-gray-500 hover:text-gray-700` - Gray text, darker on hover
- `flex-shrink-0` - Prevents shrinking

**Message Section:**
```tsx
<div>
  <p className="text-sm font-semibold text-gray-600 mb-1">Message</p>
  <p className="text-base text-gray-800 whitespace-pre-wrap">
    {selectedNotification.message}
  </p>
</div>
```

**Label Styling:**
- `text-sm` - 14px font size
- `font-semibold` - Semi-bold weight
- `text-gray-600` - Medium gray (#4B5563)
- `mb-1` - 4px bottom margin

**Content Styling:**
- `text-base` - 16px font size
- `text-gray-800` - Dark gray (#1F2937)
- `whitespace-pre-wrap` - Preserves whitespace and line breaks

**Metadata Grid:**
```tsx
<div className="grid grid-cols-2 gap-4 pt-4 border-t">
```

**Styling:**
- `grid grid-cols-2` - 2-column grid layout
- `gap-4` - 16px gap between columns
- `pt-4 border-t` - 16px top padding and top border

**Close Button (Footer):**
```tsx
<div className="flex justify-end gap-3 mt-6 pt-4 border-t">
  <Button variant="outline" onClick={...}>
    Close
  </Button>
</div>
```

**Styling:**
- `flex justify-end` - Right-aligned flex container
- `gap-3` - 12px gap between items
- `mt-6` - 24px top margin
- `pt-4 border-t` - 16px top padding and top border

---

## Functionality

### Data Fetching
- Uses `useNotificationsData()` hook (SWR-based)
- Endpoint: `API_ENDPOINTS.GET_NOTIFICATIONS` = `/management/super/notifications`
- Auto-refetches on window focus and network reconnect
- Error handling with toast notifications

### State Management

**Local State:**
- `isNotificationOpen` - Controls popover visibility (boolean)
- `selectedNotification` - Currently selected notification object for modal
- `showNotificationModal` - Controls modal visibility (boolean)
- `markingAsRead` - Tracks which notification is being marked as read (number | null)

**Derived State:**
- `notifications` - Top 10 notifications (sorted by date, newest first)
- `unreadCount` - Count of unread notifications from top 10

### Data Processing

**Location:** Lines 84-136

1. **Data Extraction:**
   - Handles nested arrays and different response structures
   - Flattens nested arrays if present
   - Extracts from `data`, `results`, or direct array

2. **Read Status Merge:**
   - Loads read notification IDs from `localStorage` (key: `'readNotifications'`)
   - Merges with API data to mark notifications as read
   - Updates `read`, `isRead`, and `readAt` properties

3. **Sorting:**
   - Sorts by `createdAt` date (newest first)
   - Handles missing dates gracefully

4. **Limiting:**
   - Shows only top 10 latest notifications
   - Reduces load and improves performance

5. **Unread Calculation:**
   - Counts notifications where:
     - `read !== true`
     - `isRead !== true`
     - `readAt` is null or undefined

### Read Status Management

**Location:** Lines 151-205

- **Client-side only** (no API endpoint for marking as read)
- Stored in `localStorage` as JSON array of notification IDs
- Key: `'readNotifications'`
- Updates SWR cache optimistically
- Handles multiple response formats (array, object with `data`, object with `results`)

**Process:**
1. User clicks notification
2. Notification ID added to localStorage array
3. SWR cache updated immediately (optimistic update)
4. UI reflects read status instantly

### Event Handlers

**1. `handleNotificationClick` (Lines 139-148):**
```tsx
const handleNotificationClick = async (notification: Notification) => {
  setSelectedNotification(notification);
  setShowNotificationModal(true);
  setIsNotificationOpen(false);
  
  // Mark as read if not already read
  if (notification.read !== true && notification.isRead !== true && (!notification.readAt || notification.readAt === null)) {
    await markNotificationAsRead(notification.id);
  }
};
```

**Actions:**
- Sets selected notification
- Opens modal
- Closes popover
- Marks as read if unread

**2. `markNotificationAsRead` (Lines 151-205):**
```tsx
const markNotificationAsRead = async (notificationId: number) => {
  setMarkingAsRead(notificationId);
  try {
    // Store in localStorage
    if (typeof window !== 'undefined') {
      const storedReadNotifications = localStorage.getItem('readNotifications');
      const readIds = storedReadNotifications ? JSON.parse(storedReadNotifications) : [];
      if (!readIds.includes(notificationId)) {
        readIds.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readIds));
      }
    }
    
    // Update SWR cache optimistically
    mutate(API_ENDPOINTS.GET_NOTIFICATIONS, (currentData: any) => {
      // ... update logic
    }, false);
  } catch (error) {
    console.error("Error marking notification as read:", error);
  } finally {
    setMarkingAsRead(null);
  }
};
```

**Actions:**
- Saves to localStorage
- Updates SWR cache
- Handles errors gracefully

**3. `handleViewAllNotifications` (Lines 208-211):**
```tsx
const handleViewAllNotifications = () => {
  router.push("/dashboard/notifications");
  setIsNotificationOpen(false);
};
```

**Actions:**
- Navigates to full notifications page
- Closes popover

---

## Color Palette

| Element | Color | Hex Code | Tailwind Class |
|---------|-------|----------|---------------|
| Bell Icon | Dark Blue | `#003465` | (from BellIcon component) |
| Unread Badge | Red | `#EF4444` | `bg-red-500` |
| Notification Title | Dark Blue | `#003465` | `text-[#003465]` |
| Notification Message | Gray | `#4B5563` | `text-gray-600` |
| Notification Date | Light Gray | `#9CA3AF` | `text-gray-400` |
| Unread Background | Light Blue | `#EFF6FF` | `bg-blue-50` |
| Unread Dot | Blue | `#3B82F6` | `bg-blue-500` |
| Hover Background | Light Gray | `#F9FAFB` | `hover:bg-gray-50` |
| Modal Overlay | Black (50% opacity) | - | `bg-black bg-opacity-50` |
| Empty State Text | Medium Gray | `#6B7280` | `text-gray-500` |

---

## Responsive Behavior

- **Mobile:** Popover width adjusts to screen, scrollable list
- **Tablet:** Same as mobile
- **Desktop:** Full 320px width, right-aligned with trigger

---

## Complete User Flow

1. **User clicks bell icon** → Popover opens
2. **Shows top 10 notifications** (newest first, sorted by `createdAt`)
3. **Unread items highlighted** with light blue background and blue dot indicator
4. **User clicks notification** → Modal opens with full details
5. **Notification marked as read** (saved to localStorage + cache updated)
6. **Unread count updates** automatically (badge disappears if count reaches 0)
7. **"View all notification" button** → Navigates to `/dashboard/notifications` page

---

## Dependencies

### React/Next.js
```typescript
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
```

### UI Components
```typescript
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
```

### Icons
```typescript
import { BellIcon } from "../icons/icon";
import { X } from "lucide-react";
```

### Hooks & Utilities
```typescript
import { useNotificationsData } from "@/hooks/swr";
import { mutate } from "swr";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { Notification } from "@/lib/types";
```

---

## Notification Data Structure

```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
  isRead?: boolean;
  readAt?: string | null;
  tenant?: {
    name: string;
  };
}
```

---

## Key Features

✅ **Real-time updates** - SWR auto-refetches on focus/reconnect  
✅ **Unread count badge** - Red dot indicator on bell icon  
✅ **Click to view details** - Full modal with complete information  
✅ **Auto-mark as read** - Notifications marked when clicked  
✅ **Persistent read status** - Stored in localStorage  
✅ **View all link** - Navigate to full notifications page  
✅ **Responsive design** - Works on all screen sizes  
✅ **Loading states** - Handled by SWR  
✅ **Error handling** - Toast notifications for errors  
✅ **Optimistic updates** - Instant UI feedback  

---

## Implementation Notes

- **Client-side read tracking:** No API endpoint exists for marking notifications as read, so it's handled entirely client-side using localStorage
- **Top 10 limit:** Only shows latest 10 notifications in popover to improve performance
- **Multiple data formats:** Handles various API response structures (array, nested objects)
- **Date formatting:** Uses `toLocaleDateString()` for dates and `toLocaleString()` for full date-time
- **Accessibility:** Uses semantic HTML and proper ARIA attributes via Radix UI Popover component

---


---

*Last Updated: Based on current implementation in MainHeader.tsx*

