import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json([
      { id: 1, title: "Team Sync", date: "2026-08-11", timeSlot: "9:00 AM" },
      { id: 2, title: "Project Review", date: "2026-08-11", timeSlot: "11:00 AM" },
      { id: 3, title: "Client Meeting", date: "2026-08-11", timeSlot: "2:00 PM" },
      { id: 4, title: "Design Workshop", date: "2026-08-12", timeSlot: "10:00 AM" }
    ]);
  })
];
