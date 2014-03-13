require 'mongoid'

class Quest
  include Mongoid::Document

  has_many :levels
  field :levels, :type => Array, :default => []

  has_many :completedobjects
  field :completedobjects, :type => Array, :default => []

  field :label, :type => String
  field :locked, :type => Boolean, :default => true
  field :assignedgroups, :type => Array, :default => []
end