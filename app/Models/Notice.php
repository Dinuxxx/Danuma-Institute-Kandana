<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'details',
        'attachment',
        'visibility',
        'user_id'
    ];
    
    protected $casts = [
        'visibility' => 'array',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    // Scope to get notices visible to a specific role
    public function scopeVisibleToRole($query, $role)
    {
        return $query->where(function($q) use ($role) {
            $q->whereJsonContains('visibility', $role)
              ->orWhereJsonContains('visibility', 'All');
        });
    }
    
    // Scope to get notices created by a specific user
    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}