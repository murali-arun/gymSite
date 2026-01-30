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
    <div className="space-y-6">
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
