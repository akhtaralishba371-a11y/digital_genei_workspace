<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    // GET /api/documents
    public function index()
    {
        return Document::all();
    }

    // POST /api/documents
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string',
            'emoji'       => 'nullable|string',
            'blocks'      => 'nullable|array',
            'updatedById' => 'nullable|string',
            'workspaceId' => 'nullable|string',
        ]);

        $doc = Document::create([
            'id'          => 'doc_' . Str::random(10),
            'title'       => $data['title'],
            'emoji'       => $data['emoji'] ?? '📄',
            'blocks'      => $data['blocks'] ?? [],
            'updatedById' => $data['updatedById'] ?? null,
            'workspaceId' => $data['workspaceId'] ?? 'w1',
            'isFavorite'  => false,
            'updatedAt'   => 'just now',
        ]);

        return $doc->fresh();
    }

    // PUT /api/documents/{id}
    public function update(Request $request, string $id)
    {
        $doc = Document::findOrFail($id);
        $doc->fill($request->only([
            'title', 'emoji', 'blocks', 'updatedById', 'isFavorite', 'workspaceId',
        ]));
        $doc->updatedAt = 'just now';
        $doc->save();

        return $doc->fresh();
    }
}
