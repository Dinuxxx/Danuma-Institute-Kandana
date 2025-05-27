<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentsFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'payment_id';
    
    protected $fillable = [
        'method',
        'status',
        'amount',
        'verified_by',
        'student_id',
        'proof_path',
    ];

    //get the user who verified this payment 
    public function verifiedUser() :BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by', 'id');
    }

     //get the student of whom this payment
    public function student() :BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    // get the courses for which this payment made
    public function paymentCourses(): HasMany
    {
        return $this->hasMany(PaymentCourse::class, 'payment_id', 'payment_id');
    }
}
