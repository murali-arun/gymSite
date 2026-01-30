import React from 'react';

function ProfileFormBuilder({ formData, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const toggleArrayField = (field, value) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...formData, [field]: updated });
  };

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Step 1: Quick Stats */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-5 border border-blue-800/50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-bold text-white">Quick Stats</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Height Presets */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Height</label>
            <div className="grid grid-cols-3 gap-2">
              {["5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleChange('height', h)}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                    formData.height === h
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Other"
              value={!["5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""].includes(formData.height) ? formData.height : ''}
              onChange={(e) => handleChange('height', e.target.value)}
              className="w-full mt-2 px-3 py-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Weight Range */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Current Weight</label>
            <div className="grid grid-cols-3 gap-2">
              {["140 lbs", "160 lbs", "180 lbs", "200 lbs", "220 lbs", "240+ lbs"].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleChange('weight', w)}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                    formData.weight === w
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Other"
              value={!["140 lbs", "160 lbs", "180 lbs", "200 lbs", "220 lbs", "240+ lbs"].includes(formData.weight) ? formData.weight : ''}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full mt-2 px-3 py-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Primary Goal - Big Buttons */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">Primary Goal</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Build Muscle', emoji: '💪', desc: 'Gain strength & size' },
              { id: 'Lose Fat', emoji: '🔥', desc: 'Get lean & toned' },
              { id: 'Both', emoji: '⚡', desc: 'Recomp: muscle + fat loss' },
              { id: 'Athletic Performance', emoji: '🏃', desc: 'Speed, power, conditioning' }
            ].map(goal => (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleChange('goal', goal.id)}
                className={`p-3 rounded-lg text-left transition-all ${
                  formData.goal === goal.id
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">{goal.emoji}</div>
                <div className="font-bold text-sm">{goal.id}</div>
                <div className="text-xs opacity-75">{goal.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Training Schedule */}
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-5 border border-green-800/50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📅</span>
          <h3 className="text-lg font-bold text-white">Training Schedule</h3>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-2">Days per Week</label>
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map(days => (
              <button
                key={days}
                type="button"
                onClick={() => handleChange('trainingDays', days.toString())}
                className={`px-4 py-3 rounded-lg font-bold text-lg transition-all ${
                  formData.trainingDays === days.toString()
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {days}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">Equipment Available</label>
          <div className="grid grid-cols-3 gap-2">
            {['Dumbbells', 'Barbell', 'Kettlebells', 'Bands', 'Pull-up Bar', 'Bench', 'Rowing Machine', 'Treadmill', 'Bodyweight Only'].map(equip => (
              <button
                key={equip}
                type="button"
                onClick={() => toggleArrayField('equipment', equip)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                  formData.equipment?.includes(equip)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {equip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: Experience Level (determines what to ask next) */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-5 border border-purple-800/50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚡</span>
          <h3 className="text-lg font-bold text-white">Experience Level</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'Beginner', desc: 'New to training' },
            { id: 'Intermediate', desc: '6+ months consistent' },
            { id: 'Advanced', desc: '2+ years training' }
          ].map(level => (
            <button
              key={level.id}
              type="button"
              onClick={() => handleChange('experienceLevel', level.id)}
              className={`p-3 rounded-lg text-center transition-all ${
                formData.experienceLevel === level.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-bold text-sm mb-1">{level.id}</div>
              <div className="text-xs opacity-75">{level.desc}</div>
            </button>
          ))}
        </div>

        {/* Show strength inputs only for intermediate/advanced */}
        {(formData.experienceLevel === 'Intermediate' || formData.experienceLevel === 'Advanced') && (
          <div className="pt-4 border-t border-gray-600">
            <label className="block text-xs font-medium text-gray-300 mb-3">Current Strength (Optional - click if you know)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Squat', field: 'squat', examples: ['Bodyweight', '20 lbs/hand', '30 lbs/hand', '40 lbs/hand'] },
                { label: 'Deadlift/RDL', field: 'rdl', examples: ['Bodyweight', '25 lbs/hand', '35 lbs/hand', '45 lbs/hand'] },
                { label: 'Push-ups', field: 'pushup', examples: ['5-10 reps', '10-15 reps', '20+ reps', 'Elevated'] },
                { label: 'Rows', field: 'row', examples: ['20 lbs', '30 lbs', '40 lbs', '50+ lbs'] }
              ].map(exercise => (
                <div key={exercise.field} className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-400 mb-2">{exercise.label}</div>
                  <div className="grid grid-cols-2 gap-1">
                    {exercise.examples.map(ex => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => handleChange(exercise.field, ex)}
                        className={`px-2 py-1.5 text-xs rounded transition-all ${
                          formData[exercise.field] === ex
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Cardio Baseline */}
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl p-5 border border-orange-800/50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏃</span>
          <h3 className="text-lg font-bold text-white">Cardio/Conditioning</h3>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-2">What do you do? (Select all)</label>
          <div className="grid grid-cols-4 gap-2">
            {['Running', 'Rowing', 'Cycling', 'Swimming', 'Walking', 'HIIT', 'Jump Rope', 'None'].map(cardio => (
              <button
                key={cardio}
                type="button"
                onClick={() => toggleArrayField('cardioType', cardio)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                  formData.cardioType?.includes(cardio)
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cardio}
              </button>
            ))}
          </div>
        </div>

        {formData.cardioType?.length > 0 && !formData.cardioType?.includes('None') && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-600">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Recent Distance/Volume</label>
              <div className="grid grid-cols-2 gap-1">
                {['1-2 miles', '3-5 miles', '5K', '10K+', '15-30 min', '30-60 min'].map(dist => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleChange('cardioDistance', dist)}
                    className={`px-2 py-1.5 text-xs rounded transition-all ${
                      formData.cardioDistance === dist
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Pace/Effort</label>
              <div className="grid grid-cols-2 gap-1">
                {['Easy', 'Moderate', '8-10 min/mi', '10-12 min/mi', '12+ min/mi', 'Intervals'].map(pace => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => handleChange('cardioTime', pace)}
                    className={`px-2 py-1.5 text-xs rounded transition-all ${
                      formData.cardioTime === pace
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {pace}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 5: Focus & Constraints */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-5 border border-cyan-800/50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span>
          <h3 className="text-lg font-bold text-white">What to Focus On?</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {['Upper Body', 'Lower Body', 'Core', 'Mobility', 'Conditioning', 'Athletic Performance'].map(focus => (
            <button
              key={focus}
              type="button"
              onClick={() => toggleArrayField('focusAreas', focus)}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                formData.focusAreas?.includes(focus)
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {focus}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">Injuries or Limitations? (Optional)</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['None', 'Lower Back', 'Knees', 'Shoulders', 'Wrists', 'Ankles'].map(injury => (
              <button
                key={injury}
                type="button"
                onClick={() => handleChange('injuries', injury === 'None' ? '' : injury)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                  formData.injuries === injury || (injury === 'None' && !formData.injuries)
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {injury}
              </button>
            ))}
          </div>
          {formData.injuries && formData.injuries !== 'None' && (
            <textarea
              placeholder="Describe limitation (optional)"
              value={formData.constraints}
              onChange={(e) => handleChange('constraints', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileFormBuilder;

      {/* Personal Stats */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">📊 Personal Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Height <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder='e.g., 5\'10" or 178cm'
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Weight <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 180 lbs or 82 kg"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Weight (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., 165 lbs or 75 kg"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Primary Goal <span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="e.g., Build muscle, lose fat, improve conditioning, fit into 30-inch jeans"
            value={formData.goal}
            onChange={(e) => handleChange('goal', e.target.value)}
            rows="2"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Training Background */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">🏋️ Training Background</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Training Days per Week
          </label>
          <select
            value={formData.trainingDays}
            onChange={(e) => handleChange('trainingDays', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="6">6 days</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Available Equipment <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['Dumbbells', 'Barbell', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar', 'Bench', 'Rowing Machine', 'Treadmill', 'Bodyweight Only'].map(equip => (
              <button
                key={equip}
                type="button"
                onClick={() => toggleArrayField('equipment', equip)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.equipment?.includes(equip)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {equip}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Injuries or Limitations
          </label>
          <textarea
            placeholder="e.g., No pull-up bar, lower back sensitivity, knee issues, etc."
            value={formData.injuries}
            onChange={(e) => handleChange('injuries', e.target.value)}
            rows="2"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Current Strength (Optional) */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-2">💪 Current Strength (Optional)</h3>
        <p className="text-sm text-gray-400 mb-4">If you know your current levels, it helps AI calibrate better</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Squats
            </label>
            <input
              type="text"
              placeholder="e.g., 5x10 @ 35 lbs each hand"
              value={formData.squat}
              onChange={(e) => handleChange('squat', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              RDL / Deadlift
            </label>
            <input
              type="text"
              placeholder="e.g., 4x8 @ 40 lbs each hand"
              value={formData.rdl}
              onChange={(e) => handleChange('rdl', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rows
            </label>
            <input
              type="text"
              placeholder="e.g., 4x10 @ 40 lbs"
              value={formData.row}
              onChange={(e) => handleChange('row', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Push-ups
            </label>
            <input
              type="text"
              placeholder="e.g., 3x10 elevated, 1x15 floor"
              value={formData.pushup}
              onChange={(e) => handleChange('pushup', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Cardio (Optional) */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-2">🏃 Cardio/Conditioning (Optional)</h3>
        <p className="text-sm text-gray-400 mb-4">Current cardio baseline if any</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Cardio Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Running', 'Rowing', 'Cycling', 'Swimming', 'Walking', 'HIIT', 'Jump Rope', 'None'].map(cardio => (
              <button
                key={cardio}
                type="button"
                onClick={() => toggleArrayField('cardioType', cardio)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.cardioType?.includes(cardio)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cardio}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recent Distance/Volume
            </label>
            <input
              type="text"
              placeholder="e.g., 4 miles, 30 min rowing"
              value={formData.cardioDistance}
              onChange={(e) => handleChange('cardioDistance', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recent Time/Pace
            </label>
            <input
              type="text"
              placeholder="e.g., 47 min, 10:00/mile pace"
              value={formData.cardioTime}
              onChange={(e) => handleChange('cardioTime', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Focus & Preferences */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-4">🎯 Focus & Preferences</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Training Focus Areas
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['Strength', 'Hypertrophy', 'Fat Loss', 'Conditioning', 'Mobility', 'Core', 'Upper Body', 'Lower Body', 'Athletic Performance'].map(focus => (
              <button
                key={focus}
                type="button"
                onClick={() => toggleArrayField('focusAreas', focus)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.focusAreas?.includes(focus)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {focus}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Other Constraints or Preferences
          </label>
          <textarea
            placeholder="e.g., Work demanding job so need sustainable programming, prefer morning workouts, avoid high-impact due to joint concerns, etc."
            value={formData.constraints}
            onChange={(e) => handleChange('constraints', e.target.value)}
            rows="3"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileFormBuilder;
