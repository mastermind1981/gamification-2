require 'mongoid'

class Task
  include Mongoid::Document

  belongs_to :level

  field :label, :type => String
  field :introduction, :type => String
  field :completed_groups, :type => Array, :default => []
end