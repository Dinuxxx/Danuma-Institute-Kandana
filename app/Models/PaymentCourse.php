<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentCourse extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentCourseFactory> */
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'row_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    // Mass-assignable attributes
    protected $fillable = ['month','amount','course_id'];

    //get the payments records
    public function payments():BelongsTo
    {
        return $this->belongsTo(Payments::class, 'payment_id', 'payment_id');
    }

    //get the course of the record
    public function course():BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}
