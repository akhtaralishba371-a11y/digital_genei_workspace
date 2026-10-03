<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'message' => ['nullable', 'string', 'max:10000'],
            'content' => ['nullable', 'string', 'max:10000'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['array'],
            'files' => ['nullable', 'array', 'max:10'],
            'files.*' => ['array'],
            'parentId' => ['nullable', 'string', 'exists:messages,id'],
            'channelId' => ['nullable', 'string'],
            'recipientId' => ['nullable', 'string', 'exists:users,id'],
            'audioDuration' => ['nullable', 'string', 'max:30'],
            'audioPath' => ['nullable', 'string', 'max:2048'],
            'audioMime' => ['nullable', 'string', 'max:100'],
            'audioSize' => ['nullable', 'integer', 'min:0', 'max:20971520'],
            'encryptedPayload' => ['nullable', 'string'],
            'encryptionMeta' => ['nullable', 'array'],
            'linkPreviews' => ['nullable', 'array', 'max:3'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $text = trim((string) ($this->input('message') ?? $this->input('content') ?? ''));
            $attachments = $this->input('attachments', $this->input('files', []));
            $hasAudio = $this->filled('audioPath');
            $hasEncryptedPayload = $this->filled('encryptedPayload');
            if ($text === '' && empty($attachments) && ! $hasAudio && ! $hasEncryptedPayload) {
                $validator->errors()->add('content', 'A message must contain text, an attachment, audio, or encrypted content.');
            }
        });
    }
}
