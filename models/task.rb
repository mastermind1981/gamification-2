require 'mongoid'

class Task
  include Mongoid::Document

  belongs_to :level

  field :label, :type => String
  field :introduction, :type => String
  field :completedGroups, :type => Array, :default => []
end