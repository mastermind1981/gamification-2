require 'mongoid'

class Quest
  include Mongoid::Document

  has_many :levels
  field :levels, :type => Array, :default => []

  field :label, :type => String
  field :assigned_groups, :type => Array, :default => []
  field :completed_groups, :type => Array, :default => []
end