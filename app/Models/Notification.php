<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read',
        'read_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data' => 'array',
        'read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get formatted created at date.
     *
     * @return string
     */
    public function getCreatedAtFormattedAttribute(): string
    {
        $createdAt = $this->created_at;
        $now = Carbon::now();
        
        if ($createdAt->isToday()) {
            return $createdAt->format('h:i A');
        } elseif ($createdAt->isYesterday()) {
            return 'Yesterday at ' . $createdAt->format('h:i A');
        } elseif ($createdAt->greaterThan($now->subDays(7))) {
            return $createdAt->format('l') . ' at ' . $createdAt->format('h:i A');
        } else {
            return $createdAt->format('M d, Y h:i A');
        }
    }
}