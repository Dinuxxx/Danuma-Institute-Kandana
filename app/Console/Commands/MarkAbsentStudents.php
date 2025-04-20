<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\AttendanceController;

class MarkAbsentStudents extends Command
{
    protected $signature = 'attendance:mark-absent {date?}';
    protected $description = 'Mark absent students for courses they were scheduled to attend';

    public function handle()
    {
        $date = $this->argument('date');
        
        $controller = new AttendanceController();
        $result = $controller->markAbsentStudents($date);
        
        if ($result) {
            $this->info('Successfully marked absent students');
        } else {
            $this->error('Failed to mark absent students');
        }
        
        return $result ? 0 : 1;
    }
}