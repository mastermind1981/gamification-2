require 'mongoid'

class ChecklistItem
  include Mongoid::Document

  field :description, :type => String
  field :frequency, :type => String
  field :completed_users, :type => Array, :default => []
end