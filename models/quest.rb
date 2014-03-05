require 'mongoid'

class Quest
  include Mongoid::Document

  has_many :levels
  field :levels, :type => Array, :default => []

  field :label, :type => String
  field :assignedGroups, :type => Array, :default => []
  field :completedGroups, :type => Array, :default => []
end