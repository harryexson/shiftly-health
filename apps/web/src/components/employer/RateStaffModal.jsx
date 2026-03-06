import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, CheckCircle, Loader2 } from "lucide-react";

export default function RateStaffModal({ shift, staff, onClose }) {
  const [ratings, setRatings] = useState({
    overall: 0,
    punctuality: 0,
    professionalism: 0,
    clinical_skills: 0,
    teamwork: 0
  });
  const [wouldHireAgain, setWouldHireAgain] = useState(true);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: async (ratingData) => {
      // Create the rating
      const rating = await base44.entities.StaffRating.create(ratingData);
      
      // Update staff profile with new average rating
      const allRatings = await base44.entities.StaffRating.filter({
        staff_email: staff.user_email
      });
      
      const avgRating = allRatings.reduce((sum, r) => sum + r.overall_rating, 0) / allRatings.length;
      
      await base44.entities.StaffProfile.update(staff.id, {
        average_rating: avgRating,
        total_ratings: allRatings.length
      });

      return rating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['staff-profile'] });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    },
  });

  const StarRating = ({ value, onChange, label }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 ${
                  star <= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 self-center">
            {value > 0 ? `${value}/5` : 'Not rated'}
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    if (ratings.overall === 0) {
      alert('Please provide at least an overall rating');
      return;
    }

    submitRatingMutation.mutate({
      staff_email: staff.user_email,
      employer_email: shift.employer_email,
      shift_id: shift.id,
      overall_rating: ratings.overall,
      punctuality_rating: ratings.punctuality || ratings.overall,
      professionalism_rating: ratings.professionalism || ratings.overall,
      clinical_skills_rating: ratings.clinical_skills || ratings.overall,
      teamwork_rating: ratings.teamwork || ratings.overall,
      would_hire_again: wouldHireAgain,
      comment: comment,
      rating_date: new Date().toISOString()
    });
  };

  if (submitted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Rating Submitted!</h3>
            <p className="text-gray-600">
              Thank you for your feedback. This helps us improve our matching algorithm.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Rate {staff.full_name}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Shift: {shift.title} - {new Date(shift.shift_date).toLocaleDateString()}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <StarRating
              value={ratings.overall}
              onChange={(val) => setRatings({ ...ratings, overall: val })}
              label="Overall Rating *"
            />
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Detailed Ratings (Optional)</h4>
            
            <StarRating
              value={ratings.punctuality}
              onChange={(val) => setRatings({ ...ratings, punctuality: val })}
              label="Punctuality & Attendance"
            />

            <StarRating
              value={ratings.professionalism}
              onChange={(val) => setRatings({ ...ratings, professionalism: val })}
              label="Professionalism & Communication"
            />

            <StarRating
              value={ratings.clinical_skills}
              onChange={(val) => setRatings({ ...ratings, clinical_skills: val })}
              label="Clinical Skills & Competence"
            />

            <StarRating
              value={ratings.teamwork}
              onChange={(val) => setRatings({ ...ratings, teamwork: val })}
              label="Teamwork & Collaboration"
            />
          </div>

          {/* Would Hire Again */}
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <Label className="font-semibold text-gray-900">Would hire this staff member again?</Label>
              <p className="text-sm text-gray-600 mt-1">
                This helps prioritize them for your future shifts
              </p>
            </div>
            <Switch
              checked={wouldHireAgain}
              onCheckedChange={setWouldHireAgain}
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience working with this staff member..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comments are private and help improve our matching algorithm
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitRatingMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitRatingMutation.isPending || ratings.overall === 0}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {submitRatingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}