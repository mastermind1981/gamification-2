require 'mongoid'

class Checklistitem
  include Mongoid::Document

  has_many :completedobjects
  field :completedobjects, :type => Array, :default => []

  field :description, :type => String
  field :frequency, :type => String
end