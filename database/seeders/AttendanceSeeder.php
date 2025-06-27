<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\TimeTables;
use App\Models\Attendance;
use App\Models\CourseAttendance;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = Student::all();
        $timeTables = TimeTables::all();

        foreach ($students as $student) {
            // Simulate attendance for random 3 to 7 days in the past
            for ($i = 0; $i < rand(3, 7); $i++) {
                $date = Carbon::now()->subDays($i);
                $dayOfWeek = $date->format('l'); // Monday, Tuesday, etc.
                
                $timetableGroup = $timeTables->where('day_of_week', $dayOfWeek);
                if ($timetableGroup->isEmpty()) continue;

                // Randomly decide if student is present or absent on this day
                $status = rand(0, 1) ? 'Present' : 'Absent';

                $attendance = Attendance::factory()->create([
                    'student_id' => $student->student_id,
                    'date' => $date->toDateString(),
                    'marked_method' => rand(0, 1) ? 'QR' : 'Manual',
                    'marked_by' => 1, // Admin ID
                    'check_in_time' => $status === 'Present' ? $date->copy()->setTime(rand(7, 9), rand(0, 59)) : $date->copy()->setTime(0, 0),
                    'check_out_time' => $status === 'Present' ? $date->copy()->setTime(rand(12, 14), rand(0, 59)) : null,
                ]);

                // Assign this attendance to all slots on that day
                foreach ($timetableGroup as $slot) {
                    CourseAttendance::factory()->create([
                        'att_id' => $attendance->att_id,
                        'for_slot' => $slot->ttable_id,
                        'course_id' => $slot->course_id,
                        'status' => $status,
                    ]);
                }
            }
        }
    }
}
