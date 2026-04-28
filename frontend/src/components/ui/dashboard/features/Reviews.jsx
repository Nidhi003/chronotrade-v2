"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Gift, ThumbsUp, CheckCircle2, Send, Quote } from "lucide-react";

const SAMPLE_REVIEWS = [
  { id: 1, name: "Alex Thompson", rating: 5, text: "ChronoTradez has completely transformed my trading. The analytics are incredible and the AI insights have helped me identify patterns I never noticed before.", date: "2024-01-15", verified: true },
  { id: 2, name: "Sarah Chen", rating: 5, text: "Best trading journal I've ever used. The visual playback feature alone is worth it. My win rate improved by 15% in just 2 months!", date: "2024-01-10", verified: true },
  { id: 3, name: "Michael Rodriguez", rating: 4, text: "Great tool for serious traders. The psychology score feature really helped me understand my trading behavior.", date: "2024-01-08", verified: true },
  { id: 4, name: "Emma Wilson", rating: 5, text: "Finally a trading journal that actually works! The CSV import saved me hours of manual entry. Highly recommended!", date: "2024-01-05", verified: true },
  { id: 5, name: "David Kim", rating: 5, text: "The backtesting feature is a game changer. I can test strategies without risking real money. Incredible value!", date: "2024-01-01", verified: true },
];

export default function ReviewsPage({ user }) {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userReview, setUserReview] = useState({
    rating: 0,
    text: "",
    name: user?.email?.split('@')[0] || "Anonymous"
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [credited, setCredited] = useState(false);
  
  const [stats, setStats] = useState({
    totalReviews: 127,
    avgRating: 4.7,
    fiveStars: 89,
    fourStars: 28
  });
  
  const submitReview = () => {
    if (userReview.rating === 0 || !userReview.text.trim()) return;
    
    setSubmitting(true);
    
    setTimeout(() => {
      const newReview = {
        id: Date.now(),
        ...userReview,
        date: new Date().toISOString().split('T')[0],
        verified: true,
        isUserReview: true
      };
      
      setReviews([newReview, ...reviews]);
      setSubmitted(true);
      setCredited(true);
      
      // Dispatch event for credits
      window.dispatchEvent(new CustomEvent('addCredits', { detail: 100 }));
      
      setSubmitting(false);
    }, 1500);
  };
  
  const renderStars = (rating, interactive = false, size = "md") => {
    const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
    const starClass = sizes[size] || sizes.md;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClass} transition-all ${
              (interactive ? hoverRating || userReview.rating : rating) >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-slate-600"
            } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
            onClick={() => interactive && setUserReview({ ...userReview, rating: star })}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-yellow-500" />
            Reviews & Ratings
          </h2>
          <p className="text-slate-400">See what traders are saying about ChronoTradez</p>
        </div>
      </div>
      
      {/* Stats Banner */}
      <div className="glass rounded-2xl p-6 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-blue-500/10 border border-yellow-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              {renderStars(5, false, "lg")}
            </div>
            <div className="text-3xl font-black text-white">{stats.avgRating}</div>
            <div className="text-sm text-slate-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white">{stats.totalReviews}</div>
            <div className="text-sm text-slate-400">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400">{stats.fiveStars}%</div>
            <div className="text-sm text-slate-400">5-Star Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-1">
              <Gift className="h-6 w-6" /> 100
            </div>
            <div className="text-sm text-slate-400">Credits for Review</div>
          </div>
        </div>
      </div>
      
      {/* Write Review Button */}
      {!submitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Share Your Experience</h3>
              <p className="text-slate-400 text-sm mt-1">Help other traders discover ChronoTradez</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl text-white font-bold transition"
            >
              {showForm ? 'Cancel' : 'Write Review'}
            </button>
          </div>
          
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 block">
                      Your Rating
                    </label>
                    <div className="flex justify-center">
                      {renderStars(userReview.rating, true, "lg")}
                    </div>
                  </div>
                  
                  {/* Name */}
                  <div>
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={userReview.name}
                      onChange={(e) => setUserReview({ ...userReview, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 transition"
                    />
                  </div>
                  
                  {/* Review Text */}
                  <div>
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                      Your Review
                    </label>
                    <textarea
                      value={userReview.text}
                      onChange={(e) => setUserReview({ ...userReview, text: e.target.value })}
                      placeholder="Share your experience with ChronoTradez..."
                      rows={4}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 transition resize-none"
                    />
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    onClick={submitReview}
                    disabled={submitting || userReview.rating === 0 || !userReview.text.trim()}
                    className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                      submitting || userReview.rating === 0 || !userReview.text.trim()
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                          <Send className="h-5 w-5" />
                        </motion.div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Submit Review & Earn 100 Credits
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-xs text-slate-500">
                    By submitting, you agree to share your review publicly
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Success Message */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/10"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-slate-400 mb-4">Your review has been submitted successfully.</p>
            
            {credited && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full">
                <Gift className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">+100 Credits Awarded!</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Top Reviews */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Top Reviews</h3>
        <div className="space-y-4">
          {reviews.slice(0, 5).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-2xl p-5 ${
                review.isUserReview 
                  ? 'border-2 border-yellow-500/30 bg-yellow-500/5' 
                  : index === 0 
                  ? 'border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent'
                  : ''
              }`}
            >
              {index === 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1 bg-yellow-500 rounded-full text-xs font-bold text-black">
                    TOP REVIEW
                  </div>
                  {review.isUserReview && (
                    <div className="px-3 py-1 bg-purple-500 rounded-full text-xs font-bold text-white">
                      YOUR REVIEW
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {review.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-white">{review.name}</span>
                      {review.verified && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Verified Trader
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{review.date}</span>
                  </div>
                  
                  <div className="mb-2">
                    {renderStars(review.rating, false, "sm")}
                  </div>
                  
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 h-4 w-4 text-slate-600" />
                    <p className="text-slate-300 pl-4 leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">Helpful ({Math.floor(Math.random() * 50) + 10})</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* All Reviews Link */}
      {reviews.length > 5 && (
        <button className="w-full py-3 glass rounded-xl text-slate-400 hover:text-white transition font-bold">
          View All {reviews.length} Reviews
        </button>
      )}
    </div>
  );
}