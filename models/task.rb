require 'mongoid'

class Task
  include Mongoid::Document

  belongs_to :level

  has_many :completedobjects
  field :completedobjects, :type => Array, :default => []

  field :order, :type => Integer
  field :label, :type => String
  field :introduction, :type => String
end