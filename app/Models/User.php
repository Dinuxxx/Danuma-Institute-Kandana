<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Get the registration details associated with the user.
    public function registration(): HasOne
    {
        return $this->hasOne(UserRegistration::class,'user_id');
    }

    // get the users added by current user
    public function addedRegistrations(): HasMany
    {
        return $this->hasMany(UserRegistration::class, 'added_by', 'id');
    }   

    //get the admin details if a user is a admin
    public function admin() :HasOne
    {
        return $this->hasOne(Admin::class, 'user_id', 'id');
    }

    //get the student details if a user is a student
    public function student() :HasOne
    {
        return $this->hasOne(Student::class, 'user_id', 'id');
    }

    //get the teacher details if a user is a teacher
    public function teacher():HasOne
    {
        return $this->hasOne(Student::class, 'user_id', 'id');
    }

    // get the users added by current user
    public function loginLog() :HasMany
    {
        return $this->hasMany(LoginLog::class, 'user_id', 'id');
    } 

    // get the attendances records added by current user
    public function attendances() :HasMany
    {
        return $this->hasMany(Attendance::class, 'marked_by', 'id');
    } 

    // get the payments verified by current user
    public function payments(): HasMany
    {
        return $this->hasMany(Payments::class, 'verified_by', 'id');
    }

}
