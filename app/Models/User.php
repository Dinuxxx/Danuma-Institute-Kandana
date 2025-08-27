<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

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
            'password' => 'hashed'
        ];
    }

    // Get the registration details associated with the user.
    public function registration(): HasOne
    {
        return $this->hasOne(UserRegistration::class,'user_id');
    }

     public function userRegistration(): HasOne
    {
        return $this->registration();
    }

    // get the users added by current user
    public function addedRegistrations(): HasMany
    {
        return $this->hasMany(UserRegistration::class, 'added_by', 'id');
    }
    
     public function role(): HasOneThrough
    {
        return $this->hasOneThrough(
            Role::class, 
            UserRegistration::class, 
            'user_id',    // Foreign key on UserRegistration table
            'role_id',    // Foreign key on Role table  
            'id',         // Local key on User table
            'role_id'     // Local key on UserRegistration table
        );
    }

    // Alternative role method using the registration relationship
    public function getRoleAttribute()
    {
        if ($this->registration && $this->registration->role) {
            return $this->registration->role;
        }
        return null;
    }

    // ============ ROLE CHECKING METHODS ============

    /**
     * Get the user's role name.
     */
    public function getRoleNameAttribute(): string
    {
        if ($this->role) {
            return $this->role->role_name;
        }
        
        return 'No Role';
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role && 
               strtolower($this->role->role_name) === strtolower($role);
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is teacher.
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('teacher');
    }

    /**
     * Check if user is student.
     */
    public function isStudent(): bool
    {
        return $this->hasRole('student');
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
        return $this->hasOne(Teacher::class, 'user_id', 'id');
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
        return $this->hasMany(Payment::class, 'verified_by', 'id');
    }

   /* public function role()
    {
        return $this->belongsTo(Role::class);
    }*/

    /*public function isAdmin()
    {
        return $this->role_id === 1;
    }

    public function isTeacher()
    {
        return $this->role_id === 2;
    }

    public function isStudent()
    {
        return $this->role_id === 3;
    }*/
}
