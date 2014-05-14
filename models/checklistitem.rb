require 'mongoid'

class Checklistitem
  include Mongoid::Document

  has_many :completedobjects
  field :completedobjects, :type => Array, :default => []

  field :label, :type => String
  field :description, :type => String
  field :frequency, :type => String
  field :assignedclass, :type => Array, :default => []
  field :badges, :type => Array, :default => []
  field :isnotificationitem, :type => Boolean, :default => false
end