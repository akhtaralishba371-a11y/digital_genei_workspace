<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    // GET /api/tasks  → each task includes resolved `assignees` (full user objects)
    public function index()
    {
        $users = User::all()->keyBy('id');

        return Task::all()->map(function (Task $task) use ($users) {
            $arr = $task->toArray();
            $arr['assignees'] = collect($task->assigneeIds ?? [])
                ->map(fn ($id) => $users->get($id))
                ->filter()
                ->values();

            return $arr;
        });
    }

    // POST /api/tasks
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string',
            'description' => 'nullable|string',
            'status'      => 'nullable|string',
            'priority'    => 'nullable|string',
            'dueDate'     => 'nullable|string',
            'assigneeIds' => 'nullable|array',
            'project'     => 'nullable|string',
            'sprint'      => 'nullable|string',
        ]);

        return Task::create(array_merge($data, [
            'id'       => 't_' . Str::random(10),
            'status'   => $data['status'] ?? 'todo',
            'priority' => $data['priority'] ?? 'medium',
        ]));
    }

    // PUT /api/tasks/{id}  → e.g. drag across kanban columns updates status
    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);
        $task->fill($request->only([
            'title', 'description', 'status', 'priority', 'dueDate',
            'assigneeIds', 'project', 'sprint', 'timeSpentMinutes',
            'timeEstimateMinutes', 'dependencies',
        ]));
        $task->save();

        return $task;
    }

    // DELETE /api/tasks/{id}
    public function destroy(string $id)
    {
        Task::where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }
}
