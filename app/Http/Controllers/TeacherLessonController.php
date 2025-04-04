<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudyMaterial;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TeacherLessonController extends Controller
{
    /**
     * Display a listing of the study materials for a specific course.
     */
    public function index(Request $request)
    {
        $query = StudyMaterial::query();
        
        // Filter by course_id if provided
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        
        $materials = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($materials);
    }

    /**
     * Store a newly created study material.
     */
    public function store(Request $request)
    {
        // Debug the request data
        \Log::info('Request data:', $request->all());
        
        // Validate basic fields
        $validator = Validator::make($request->all(), [
            'material_title' => 'required|string|max:200',
            'material_desc' => 'nullable|string',
            'course_id' => 'required|string', // Ensure course_id is validated as string
            'material_type' => 'required|in:file,link,both',
            'original_filename' => 'nullable|string', // Add validation for original_filename
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $material = new StudyMaterial();
            $material->material_title = $request->material_title;
            $material->material_desc = $request->material_desc;
            
            // Fix: Convert boolean string to integer for is_visible
            $material->is_visible = $request->has('is_visible') ? 
                ($request->is_visible === 'true' || $request->is_visible === true || $request->is_visible === '1' || $request->is_visible === 1 ? 1 : 0) : 1;
                
            // Ensure course_id is treated as string
            $material->course_id = (string) $request->course_id;

            // Handle file upload if present
            if (in_array($request->material_type, ['file', 'both']) && $request->hasFile('material_path')) {
                $validator = Validator::make($request->all(), [
                    'material_path' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,zip',
                ]);

                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }

                $path = $request->file('material_path')->store('study_materials');
                $material->material_path = $path;
                
                // Store original filename if provided
                if ($request->has('original_filename')) {
                    $material->original_filename = $request->original_filename;
                } else {
                    $material->original_filename = $request->file('material_path')->getClientOriginalName();
                }
            }

            // Handle URL if present
            if (in_array($request->material_type, ['link', 'both']) && $request->has('material_url')) {
                $validator = Validator::make($request->all(), [
                    'material_url' => 'required|string',
                    'material_url_title' => 'nullable|string|max:100',
                ]);

                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }

                $material->material_url = $request->material_url;
                $material->material_url_title = $request->material_url_title ?? 'Link';
            }

            $material->save();

            return response()->json($material, 201);
        } catch (\Exception $e) {
            \Log::error('Error saving study material: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified study material.
     */
    public function show($id)
    {
        $material = StudyMaterial::findOrFail($id);
        return response()->json($material);
    }

    /**
     * Update the specified study material.
     */
    public function update(Request $request, $id)
    {
        \Log::info('Update request data:', $request->all());
        
        $material = StudyMaterial::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'material_title' => 'sometimes|required|string|max:200',
            'material_desc' => 'nullable|string',
            'is_visible' => 'boolean',
            'course_id' => 'sometimes|required|string', // Ensure course_id is validated as string
            'original_filename' => 'nullable|string', // Add validation for original_filename
            'remove_file' => 'nullable|boolean', // Add validation for file removal flag
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update basic information
        if ($request->has('material_title')) {
            $material->material_title = $request->material_title;
        }
        
        if ($request->has('material_desc')) {
            $material->material_desc = $request->material_desc;
        }
        
        // Fix: Convert boolean string to integer for is_visible
        if ($request->has('is_visible')) {
            $material->is_visible = $request->is_visible === 'true' || $request->is_visible === true || $request->is_visible === '1' || $request->is_visible === 1 ? 1 : 0;
        }
        
        if ($request->has('course_id')) {
            $material->course_id = (string) $request->course_id;
        }

        // Handle file removal if requested
        if ($request->has('remove_file') && ($request->remove_file === '1' || $request->remove_file === true || $request->remove_file === 1)) {
            if ($material->material_path) {
                \Log::info('Removing file: ' . $material->material_path);
                Storage::delete($material->material_path);
                $material->material_path = null;
                $material->original_filename = null;
            }
        }

        // Handle file upload if present
        if ($request->hasFile('material_path')) {
            $validator = Validator::make($request->all(), [
                'material_path' => 'file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,zip',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Delete old file if exists
            if ($material->material_path) {
                Storage::delete($material->material_path);
            }
            
            $path = $request->file('material_path')->store('study_materials');
            $material->material_path = $path;
            
            // Update original filename
            if ($request->has('original_filename')) {
                $material->original_filename = $request->original_filename;
            } else {
                $material->original_filename = $request->file('material_path')->getClientOriginalName();
            }
        }

        // Handle URL if present
        if ($request->has('material_url')) {
            $validator = Validator::make($request->all(), [
                'material_url' => 'string',
                'material_url_title' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $material->material_url = $request->material_url;
            
            if ($request->has('material_url_title')) {
                $material->material_url_title = $request->material_url_title;
            } else if (!$material->material_url_title) {
                $material->material_url_title = 'Link';
            }
        }

        // Verify that we have at least a file or a URL
        if (!$material->material_path && !$request->hasFile('material_path') && empty($material->material_url) && empty($request->material_url)) {
            return response()->json(['message' => 'Material must have either a file or URL'], 400);
        }

        $material->save();

        return response()->json($material);
    }

    /**
     * Toggle study material visibility.
     */
    public function toggleVisibility($id)
    {
        $material = StudyMaterial::findOrFail($id);
        $material->is_visible = !$material->is_visible;
        $material->save();
        
        return response()->json([
            'message' => 'Visibility updated successfully',
            'is_visible' => $material->is_visible
        ]);
    }

    /**
     * Remove the specified study material.
     */
    public function destroy($id)
    {
        $material = StudyMaterial::findOrFail($id);
        
        // Delete file if exists
        if ($material->material_path) {
            Storage::delete($material->material_path);
        }
        
        $material->delete();
        
        return response()->json(['message' => 'Study material deleted successfully']);
    }

    /**
     * Remove only the file from a study material.
     */
    public function removeFile($id)
    {
        $material = StudyMaterial::findOrFail($id);
        
        // Check if material has a file
        if (!$material->material_path) {
            return response()->json(['message' => 'No file to remove'], 400);
        }
        
        // Delete file from storage
        Storage::delete($material->material_path);
        
        // Update material record
        $material->material_path = null;
        $material->original_filename = null;
        
        // If material also has no URL, return error
        if (!$material->material_url) {
            return response()->json(['message' => 'Material must have either a file or URL'], 400);
        } else {
            // Update material type to 'link' since only the URL remains
            $material->save();
            return response()->json(['message' => 'File removed successfully']);
        }
    }

    /**
     * Remove only the URL from a study material.
     */
    public function removeUrl($id)
    {
        $material = StudyMaterial::findOrFail($id);
        
        // Check if material has a URL
        if (!$material->material_url) {
            return response()->json(['message' => 'No URL to remove'], 400);
        }
        
        // Update material record
        $material->material_url = null;
        $material->material_url_title = null;
        
        // If material also has no file, set type to null or handle accordingly
        if (!$material->material_path) {
            return response()->json(['message' => 'Material must have either a file or URL'], 400);
        } else {
            // Update material type to 'file' since only the file remains
            $material->save();
            return response()->json(['message' => 'URL removed successfully']);
        }
    }
}