require 'mongoid'

class ChecklistItem
  include Mongoid::Document

  field :description, :type => String
  field :frequency, :type => String
  field :completedUsers, :type => Array, :default => []
end