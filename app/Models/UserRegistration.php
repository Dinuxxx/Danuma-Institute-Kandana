<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRegistration extends Model
{
    /** @use HasFactory<\Database\Factories\UserRegistrationFactory> */
    use HasFactory;

    protected $fillable = [

        'registration_id',
        'title',

        'user_id',

        'first_name',
        'last_name',
        'gender',
        'dob',

        'tel_no',
        'address',
        //n'image',
        //'status',
        'user_id',
        //'added_by',
        
   
        'role',
    ];



    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }


}
